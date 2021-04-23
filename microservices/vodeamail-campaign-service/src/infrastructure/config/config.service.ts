import { Injectable } from '@nestjs/common';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ClientOptions, Transport } from '@nestjs/microservices';
import { ConfigServiceAbstract } from 'vnest-core';

import { EmailTemplate } from '../../domain/entities/email-template.entity';
import { EmailCampaign } from '../../domain/entities/email-campaign.entity';
import { EmailCampaignGroup } from '../../domain/entities/email-campaign-group.entity';
import { EmailCampaignAudience } from '../../domain/entities/email-campaign-audience.entity';
import { EmailCampaignAnalytic } from '../../domain/entities/email-campaign-analytic.entity';
import { SummaryEmailCampaignView } from '../../domain/views/summary-email-campaign.view';
import { SummaryEmailCampaignAnalyticView } from '../../domain/views/summary-email-campaign-analytic.view';
import { OutstandingEmailCampaignAudienceView } from '../../domain/views/outstanding-email-campaign-audience.view';
import { DashboardWidgetView } from '../../domain/views/dashboard-widget.view';
import { ChartDashboardWidgetView } from '../../domain/views/chart-dashboard-widget.view';

@Injectable()
export class ConfigService extends ConfigServiceAbstract {
  constructor() {
    super();
    super.init();
  }

  protected managedEnvKeys: string[] = [
    'APP_ENV',
    'DB_HOST',
    'DB_PORT',
    'DB_DATABASE',
    'DB_USERNAME',
    'DB_PASSWORD',
    'REDIS_URL',
  ];

  getRedisConfig(): ClientOptions {
    return {
      transport: Transport.REDIS,
      options: {
        url: this.getValue('REDIS_URL', true),
      },
    };
  }

  getDatabaseConfig() {
    return {
      type: 'mysql',
      host: this.getValue('DB_HOST', true),
      port: this.getValue('DB_PORT', true),
      username: this.getValue('DB_USERNAME', true),
      password: this.getValue('DB_PASSWORD', true),
      database: this.getValue('DB_DATABASE', true),
      synchronize: !this.isProduction(),
      dropSchema: false,
      logging: false,
      namingStrategy: new SnakeNamingStrategy(),
      entities: [
        EmailTemplate,
        EmailCampaign,
        EmailCampaignGroup,
        EmailCampaignAudience,
        EmailCampaignAnalytic,
        SummaryEmailCampaignView,
        SummaryEmailCampaignAnalyticView,
        OutstandingEmailCampaignAudienceView,
        DashboardWidgetView,
        ChartDashboardWidgetView,
      ],
      migrations: ['src/infrastructure/database/migrations/**/*.{ts,js}'],
      cli: {
        entitiesDir: 'src',
        migrationsDir: 'src/infrastructure/database/migrations',
      },

      //typeorm-seeding
      seeds: ['src/infrastructure/database/seeders/*.seeder.{ts,js}'],
      factories: ['src/infrastructure/database/factories/*.factory.{ts,js}'],
    };
  }
}
