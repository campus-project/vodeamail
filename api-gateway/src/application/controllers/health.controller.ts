import { Controller, Get, Inject, Query } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { ClientProxy } from '@nestjs/microservices';
import { clientProxyException, Public } from 'vnest-core';

@Controller('health')
export class HealthController {
  constructor(
    @Inject('REDIS_TRANSPORT')
    private readonly redisClient: ClientProxy,
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly db: TypeOrmHealthIndicator,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  async healthCheck() {
    return await this.health.check([
      () => this.http.pingCheck('network', 'https://www.google.com/'),
      () => this.db.pingCheck('database', { timeout: 300 }),
    ]);
  }

  @Public()
  @Get('/ms-account')
  async heathCheckMsAccount() {
    const data = await this.redisClient
      .send('MS_ACCOUNT_HEALTH_CHECK', {})
      .toPromise()
      .catch(clientProxyException);

    return { data };
  }

  @Public()
  @Get('/ms-audience')
  async heathCheckMsAudience() {
    const data = await this.redisClient
      .send('MS_AUDIENCE_HEALTH_CHECK', {})
      .toPromise()
      .catch(clientProxyException);

    return { data };
  }
}
