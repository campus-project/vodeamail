import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DomainModule } from '../domain/domain.module';
import { HealthController } from './controllers/health.controller';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { OrganizationController } from './controllers/organization.controller';
import { RoleController } from './controllers/role.controller';
import { UserController } from './controllers/user.controller';

@Module({
  imports: [TerminusModule, DomainModule, InfrastructureModule],
  controllers: [
    HealthController,
    OrganizationController,
    RoleController,
    UserController,
  ],
})
export class ApplicationModule {}
