import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '../../infrastructure/config/config.service';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { clientProxyException } from 'vnest-core';

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject('REDIS_TRANSPORT')
    private readonly redisClient: ClientProxy,
    private readonly configService: ConfigService,
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

    return await this.redisClient
      .send('MS_ACCOUNT_FIND_ONE_BYPASS_ORGANIZATION_USER', {
        id: payload.subject,
      })
      .toPromise()
      .catch(clientProxyException);
  }
}
