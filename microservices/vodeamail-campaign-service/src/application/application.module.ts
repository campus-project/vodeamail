import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DomainModule } from '../domain/domain.module';
import { HealthController } from './controllers/health.controller';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { EmailCampaignController } from './controllers/email-campaign.controller';
import { EmailTemplateController } from './controllers/email-template.controller';

@Module({
  imports: [TerminusModule, DomainModule, InfrastructureModule],
  controllers: [
    HealthController,
    EmailCampaignController,
    EmailTemplateController,
  ],
})
export class ApplicationModule {}