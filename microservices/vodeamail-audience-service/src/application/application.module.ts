import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DomainModule } from '../domain/domain.module';
import { HealthController } from './controllers/health.controller';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { ContactController } from './controllers/contact.controller';
import { GroupController } from './controllers/group.controller';

@Module({
  imports: [TerminusModule, DomainModule, InfrastructureModule],
  controllers: [HealthController, ContactController, GroupController],
})
export class ApplicationModule {}
