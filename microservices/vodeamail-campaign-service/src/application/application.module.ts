import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DomainModule } from '../domain/domain.module';
import { HealthController } from './controllers/health.controller';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { EmailCampaignController } from './controllers/email-campaign.controller';
import { EmailTemplateController } from './controllers/email-template.controller';
import { EmailCampaignAudienceController } from './controllers/email-campaign-audience.controller';
import { WidgetController } from './controllers/widget.controller';

@Module({
  imports: [TerminusModule, DomainModule, InfrastructureModule],
  controllers: [
    HealthController,
    EmailCampaignController,
    EmailTemplateController,
    EmailCampaignAudienceController,
    WidgetController,
  ],
})
export class ApplicationModule {}
