import {
  BadRequestException,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  AccessTokenDto,
  DecodedAccessToken,
  DecodedRefreshToken,
  GenerateAccessTokenDto,
  GenerateRefreshTokenDto,
  RefreshTokenDto,
} from '../../application/dtos/jwt.dto';
import { JwtService as NestJwt } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshToken } from '../entities/refresh-token.entity';
import * as moment from 'moment';
import {
  GenerateAccessTokenAndRefreshTokenDto,
  GenerateAccessTokenFromRefreshTokenDto,
} from '../../application/dtos/auth.dto';
import { ClientProxy } from '@nestjs/microservices';
import { clientProxyException } from 'vnest-core';

@Injectable()
export class JwtService {
  constructor(
    private readonly jwtService: NestJwt,
    @Inject('REDIS_TRANSPORT')
    private readonly redisClient: ClientProxy,
    @Inject('AUTH_REFRESH_TOKEN_SERVICE')
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async createAccessTokenAndRefreshToken(
    generateAccessTokenAndRefreshTokenDto: GenerateAccessTokenAndRefreshTokenDto,
  ) {
    const { user_id } = generateAccessTokenAndRefreshTokenDto;

    const accessToken = await this.generateAccessToken({ user_id });
    const refreshToken = await this.generateRefreshToken({
      user_id,
    });

    const decodedAccessToken = await this.decodeAccessToken({
      access_token: accessToken,
    });

    return {
      token_type: 'Bearer',
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: decodedAccessToken.exp,
    };
  }

  async createAccessTokenFromRefreshToken(
    generateAccessTokenFromRefreshTokenDto: GenerateAccessTokenFromRefreshTokenDto,
  ) {
    const accessToken = await this.generateAccessTokenFromRefreshToken(
      generateAccessTokenFromRefreshTokenDto,
    );

    const decodedAccessToken = await this.decodeAccessToken({
      access_token: accessToken,
    });

    return {
      token_type: 'Bearer',
      access_token: accessToken,
      expires_in: decodedAccessToken.exp,
    };
  }

  async generateAccessToken(generateAccessTokenDto: GenerateAccessTokenDto) {
    const { user_id } = generateAccessTokenDto;
    return this.jwtService.sign({
      subject: user_id,
    });
  }

  async generateRefreshToken(generateRefreshTokenDto: GenerateRefreshTokenDto) {
    const { user_id } = generateRefreshTokenDto;

    const refreshToken = await this.refreshTokenService.create({
      user_id,
      ttl: 60 * 60 * 24 * 7, // 7 days
    });

    return this.jwtService.signAsync(
      {},
      {
        expiresIn: '30d',
        subject: user_id,
        jwtid: refreshToken.id,
      },
    );
  }

  async generateAccessTokenFromRefreshToken(refreshTokenDto: RefreshTokenDto) {
    const { user } = await this.resolveRefreshToken(refreshTokenDto);

    return await this.generateAccessToken({ user_id: user.id });
  }

  async resolveRefreshToken(refreshTokenDto: RefreshTokenDto) {
    const payload = await this.decodeRefreshToken(refreshTokenDto);
    const token = await this.getStoredTokenFromRefreshTokenDecodedToken(
      payload,
    );

    if (!token || token.is_revoked || token.expires_at <= moment().format()) {
      throw new BadRequestException('Refresh token expired');
    }

    const duration = moment.duration(moment(token.expires_at).diff(moment()));
    if (duration.asMinutes() < 0) {
      await this.refreshTokenService.revoke({ id: token.id });
      throw new BadRequestException('Refresh token expired');
    }

    const user = await this.getUserFromRefreshTokenDecodedToken(payload);

    return { user, token };
  }

  async decodeAccessToken(
    decodeAccessTokenDto: AccessTokenDto,
  ): Promise<DecodedAccessToken> {
    try {
      return await this.jwtService.verifyAsync(
        decodeAccessTokenDto.access_token,
      );
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnprocessableEntityException('Refresh token expired');
      } else {
        throw new UnprocessableEntityException('Refresh token malformed');
      }
    }
  }

  async decodeRefreshToken(
    decodeRefreshTokenDto: RefreshTokenDto,
  ): Promise<DecodedRefreshToken> {
    try {
      return await this.jwtService.verifyAsync(
        decodeRefreshTokenDto.refresh_token,
      );
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnprocessableEntityException('Refresh token expired');
      } else {
        throw new UnprocessableEntityException('Refresh token malformed');
      }
    }
  }

  async getUserFromRefreshTokenDecodedToken(
    decodedRefreshToken: DecodedRefreshToken,
  ): Promise<any> {
    if (!decodedRefreshToken.sub) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    const user = await this.redisClient
      .send('MS_ACCOUNT_FIND_ONE_BYPASS_ORGANIZATION_USER', {
        id: decodedRefreshToken.sub,
      })
      .toPromise()
      .catch(clientProxyException);

    if (!user) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return user;
  }

  async getStoredTokenFromRefreshTokenDecodedToken(
    decodedRefreshToken: DecodedRefreshToken,
  ): Promise<RefreshToken> {
    if (!decodedRefreshToken.jti) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return this.refreshTokenService.findOne({
      id: decodedRefreshToken.jti,
    });
  }
}
