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
];

@Module({
  imports: [
    InfrastructureModule,
    TypeOrmModule.forFeature([
      EmailCampaign,
      EmailCampaignGroup,
      EmailTemplate,
    ]),
  ],
  providers: [...providers],
  exports: [...providers],
})
export class DomainModule {}
