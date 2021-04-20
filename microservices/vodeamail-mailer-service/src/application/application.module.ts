import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DomainModule } from '../domain/domain.module';
import { HealthController } from './controllers/health.controller';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { SentEmailController } from './controllers/sent-email.controller';

@Module({
  imports: [TerminusModule, DomainModule, InfrastructureModule],
  controllers: [HealthController, SentEmailController],
})
export class ApplicationModule {}
