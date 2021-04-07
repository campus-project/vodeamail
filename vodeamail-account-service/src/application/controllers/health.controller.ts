import { Controller } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly db: TypeOrmHealthIndicator,
  ) {}

  @MessagePattern('MS_ACCOUNT_HEALTH_CHECK')
  @HealthCheck()
  healthCheck() {
    console.log('asd');
    return this.health.check([
      () => this.http.pingCheck('network', 'https://www.google.com/'),
      () => this.db.pingCheck('database', { timeout: 300 }),
    ]);
  }
}
