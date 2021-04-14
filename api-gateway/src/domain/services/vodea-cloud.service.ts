import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '../../infrastructure/config/config.service';
import {
  SignInRo,
  VodeaCloudAccountDto,
  VodeaCloudSignInDto,
  VodeaCloudTokenDto,
} from '../../application/dtos/vodea-cloud.dto';
import { JwtService } from './jwt.service';
import { ClientProxy } from '@nestjs/microservices';
import { clientProxyException } from 'vnest-core';

@Injectable()
export class VodeaCloudService {
  private readonly oauth2Config;

  constructor(
    private readonly configService: ConfigService,
    @Inject('JWT_SERVICE')
    private readonly jwtService: JwtService,
    @Inject('REDIS_TRANSPORT')
    private readonly redisClient: ClientProxy,
  ) {
    this.oauth2Config = configService.getVodeaCloudOauth2();
  }

  async signIn(vodeaCloudSignInDto: VodeaCloudSignInDto): Promise<SignInRo> {
    const vodeaCloudAccountDto: VodeaCloudAccountDto = await this.fetchAccount(
      await this.fetchToken(vodeaCloudSignInDto),
    );

    const user = await this.findOneOrCreateUser(vodeaCloudAccountDto);

    return await this.jwtService.createAccessTokenAndRefreshToken({
      user_id: user.id,
    });
  }

  async fetchToken(
    vodeaCloudSignInDto: VodeaCloudSignInDto,
  ): Promise<VodeaCloudTokenDto> {
    const { redirect_uri, code } = vodeaCloudSignInDto;

    let oauth2Token = null;

    await axios
      .post(this.oauth2Config.token_url, {
        client_id: this.oauth2Config.client_id,
        client_secret: this.oauth2Config.client_secret,
        grant_type: this.oauth2Config.grant_type,
        redirect_uri,
        code,
      })
      .then((resp) => (oauth2Token = resp.data))
      .catch((e) => {
        if (e?.response?.status === 400) {
          throw new UnauthorizedException();
        }

        throw new InternalServerErrorException();
      });

    return oauth2Token;
  }

  async fetchAccount(
    vodeaCloudTokenDto: VodeaCloudTokenDto,
  ): Promise<VodeaCloudAccountDto> {
    let user = null;

    await axios
      .get(this.oauth2Config.account_url, {
        headers: {
          Authorization: `Bearer ${vodeaCloudTokenDto.access_token}`,
        },
      })
      .then((resp) => (user = resp.data.data))
      .catch((e) => {
        if (e?.response?.status === 401) {
          throw new UnauthorizedException();
        }

        throw new InternalServerErrorException();
      });

    return user;
  }

  async findOneOrCreateUser(
    vodeaCloudAccountDto: VodeaCloudAccountDto,
  ): Promise<any> {
    let user = await this.redisClient
      .send('MS_ACCOUNT_FIND_ONE_BYPASS_ORGANIZATION_USER', {
        id: vodeaCloudAccountDto.id,
      })
      .toPromise()
      .catch(clientProxyException);

    if (!user) {
      const { additional } = vodeaCloudAccountDto;

      let roleId;
      let createdOrganization = null;
      let createdRole = null;
      let createdRoleMember = null;

      const organization = await this.redisClient
        .send('MS_ACCOUNT_FIND_ONE_ORGANIZATION', {
          id: additional.organization_id,
        })
        .toPromise()
        .catch(clientProxyException);

      if (organization) {
        const role = await this.redisClient
          .send('MS_ACCOUNT_FIND_ALL_ROLE', {
            organization_id: additional.organization_id,
            is_default: true,
          })
          .toPromise()
          .catch(clientProxyException);

        if (role && role[0] !== undefined) {
          roleId = role[0].id;
        } else {
          createdRoleMember = await this.redisClient
            .send('MS_ACCOUNT_CREATE_ROLE', {
              name: 'Member',
              organization_id: additional.organization_id,
              is_default: true,
            })
            .toPromise()
            .catch(clientProxyException);

          roleId = createdRoleMember.id;
        }
      } else {
        createdOrganization = await this.redisClient
          .send('MS_ACCOUNT_CREATE_ORGANIZATION', {
            id: additional.organization_id,
            name: additional.organization_name,
            address: additional.organization_address,
            telephone: additional.organization_telephone,
            fax: additional.organization_fax,
          })
          .toPromise()
          .catch(clientProxyException);

        createdRole = await this.redisClient
          .send('MS_ACCOUNT_CREATE_ROLE', {
            name: 'Administrator',
            organization_id: additional.organization_id,
            is_special: true,
          })
          .toPromise()
          .catch(async (e) => {
            //remove organization created
            if (createdOrganization) {
              this.redisClient.emit('MS_ACCOUNT_REMOVE_ORGANIZATION', {
                id: createdOrganization.id,
                is_hard: true,
              });
            }

            clientProxyException(e);
          });

        createdRoleMember = await this.redisClient
          .send('MS_ACCOUNT_CREATE_ROLE', {
            name: 'Member',
            organization_id: additional.organization_id,
            is_default: true,
          })
          .toPromise()
          .catch(async (e) => {
            //remove organization created
            if (createdOrganization) {
              this.redisClient.emit('MS_ACCOUNT_REMOVE_ORGANIZATION', {
                id: createdOrganization.id,
                is_hard: true,
              });
            }

            //remove role created
            if (createdRole) {
              this.redisClient.emit('MS_ACCOUNT_REMOVE_ROLE', {
                id: createdRole.id,
                is_hard: true,
              });
            }

            clientProxyException(e);
          });

        roleId = createdRole.id;
      }

      user = await this.redisClient
        .send('MS_ACCOUNT_CREATE_USER', {
          id: vodeaCloudAccountDto.id,
          name: vodeaCloudAccountDto.name,
          email: vodeaCloudAccountDto.email,
          organization_id: additional.organization_id,
          role_id: roleId,
        })
        .toPromise()
        .catch(async (e) => {
          //remove role member created
          if (createdRoleMember) {
            this.redisClient.emit('MS_ACCOUNT_REMOVE_ROLE', {
              id: createdRoleMember.id,
              is_hard: true,
            });
          }

          //remove role created
          if (createdRole) {
            this.redisClient.emit('MS_ACCOUNT_REMOVE_ROLE', {
              id: createdRole.id,
              is_hard: true,
            });
          }

          //remove organization created
          if (createdOrganization) {
            this.redisClient.emit('MS_ACCOUNT_REMOVE_ORGANIZATION', {
              id: createdOrganization.id,
              is_hard: true,
            });
          }

          clientProxyException(e);
        });
    }

    return user;
  }
}
