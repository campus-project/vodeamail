import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DomainModule } from '../domain/domain.module';
import { HealthController } from './controllers/health.controller';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { AuthStrategy } from './strategies/auth.strategy';
import { APP_GUARD } from '@nestjs/core';
import { AccountController } from './controllers/account.controller';
import { RoleController } from './controllers/microservices/role.controller';
import { ContactController } from './controllers/microservices/contact.controller';
import { GroupController } from './controllers/microservices/group.controller';
import { OrganizationController } from './controllers/microservices/organization.controller';
import { UserController } from './controllers/microservices/user.controller';

@Module({
  imports: [TerminusModule, DomainModule, InfrastructureModule],
  controllers: [
    HealthController,
    AuthController,
    AccountController,

    // ms account
    OrganizationController,
    RoleController,
    UserController,

    // ms audience
    ContactController,
    GroupController,
  ],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: AuthStrategy,
    },
  ],
})
export class ApplicationModule {}