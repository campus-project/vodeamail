import { Injectable } from '@nestjs/common';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ClientOptions, Transport } from '@nestjs/microservices';
import { ConfigServiceAbstract } from 'vnest-core';
import { MailerOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-options.interface';

import { SentEmail } from '../../domain/entities/sent-email.entity';
import { SentEmailClick } from '../../domain/entities/sent-email-click.entity';

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
      entities: [SentEmail, SentEmailClick],
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

  getMailerConfig(): MailerOptions {
    return {
      transport: {
        host: '0.0.0.0',
        port: 1025,
        secure: false,
        auth: {
          user: 'testuser',
          pass: 'testpassword',
        },
      },
      defaults: {
        from: '"vodea" <no-reply@vodea.id>',
      },
    };
  }
}
