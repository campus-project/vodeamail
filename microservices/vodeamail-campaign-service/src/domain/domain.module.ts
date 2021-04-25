import { Module, Provider } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailCampaignService } from './services/email-campaign.service';
import { EmailCampaign } from './entities/email-campaign.entity';
import { EmailCampaignGroup } from './entities/email-campaign-group.entity';
import { EmailTemplate } from './entities/email-template.entity';
import { EmailTemplateService } from './services/email-template.service';
import { ClientProxyFactory } from '@nestjs/microservices';
import { ConfigService } from '../infrastructure/config/config.service';

import { EmailCampaignAudience } from './entities/email-campaign-audience.entity';
import { EmailCampaignAnalytic } from './entities/email-campaign-analytic.entity';
import { EmailCampaignAudienceService } from './services/email-campaign-audience.service';

import { OutstandingEmailCampaignAudienceView } from './views/outstanding-email-campaign-audience.view';
import { SummaryEmailCampaignAnalyticView } from './views/summary-email-campaign-analytic.view';
import { SummaryEmailCampaignView } from './views/summary-email-campaign.view';
import { ChartEmailCampaignView } from './views/chart-email-campaign.view';
import { WidgetEmailCampaignView } from './views/widget-email-campaign.view';

const providers: Provider[] = [
  {
    provide: 'REDIS_TRANSPORT',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) =>
      ClientProxyFactory.create(configService.getRedisConfig()),
  },
  {
    provide: 'CAMPAIGN_EMAIL_CAMPAIGN_SERVICE',
    useClass: EmailCampaignService,
  },
  {
    provide: 'CAMPAIGN_EMAIL_TEMPLATE_SERVICE',
    useClass: EmailTemplateService,
  },
  {
    provide: 'CAMPAIGN_EMAIL_CAMPAIGN_AUDIENCE_SERVICE',
    useClass: EmailCampaignAudienceService,
  },
];

@Module({
  imports: [
    InfrastructureModule,
    TypeOrmModule.forFeature([
      EmailCampaign,
      EmailCampaignGroup,
      EmailCampaignAudience,
      EmailCampaignAnalytic,
      EmailTemplate,

      SummaryEmailCampaignView,
      SummaryEmailCampaignAnalyticView,
      OutstandingEmailCampaignAudienceView,
      WidgetEmailCampaignView,
      ChartEmailCampaignView,
    ]),
  ],
  providers: [...providers],
  exports: [...providers],
})
export class DomainModule {}
