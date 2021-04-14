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

  @MessagePattern('MS_CAMPAIGN_HEALTH_CHECK')
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      () => this.http.pingCheck('network', 'https://www.google.com/'),
      () => this.db.pingCheck('database', { timeout: 300 }),
    ]);
  }
}
