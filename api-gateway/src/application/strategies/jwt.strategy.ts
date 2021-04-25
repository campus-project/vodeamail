import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '../../infrastructure/config/config.service';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { clientProxyException } from 'vnest-core';
import { PermissionService } from '../../domain/services/permission.service';

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    @Inject('REDIS_TRANSPORT')
    private readonly redisClient: ClientProxy,
    @Inject('AUTH_PERMISSION_SERVICE')
    private readonly permissionService: PermissionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getJwtSecret(),
    });
  }

  async validate(payload): Promise<any> {
    if (!payload.subject) {
      return null;
    }

    const user = await this.redisClient
      .send('MS_ACCOUNT_FIND_ONE_BYPASS_ORGANIZATION_USER', {
        id: payload.subject,
        relations: ['role'],
      })
      .toPromise()
      .catch(clientProxyException);

    if (!user.role?.is_special) {
      const rolePermission = await this.permissionService.rolePermission(
        user.role_id,
      );

      Object.assign(user, {
        permissions: rolePermission.map((role) => role.permission_name),
      });
    } else {
      Object.assign(user, {
        permissions: await this.permissionService.allPermissionNames(),
      });
    }

    return user;
  }
}
