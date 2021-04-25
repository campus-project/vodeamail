import { Injectable } from '@nestjs/common';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ClientOptions, Transport } from '@nestjs/microservices';
import { ConfigServiceAbstract } from 'vnest-core';

import { Organization } from '../../domain/entities/organization.entity';
import { Role } from '../../domain/entities/role.entity';
import { User } from '../../domain/entities/user.entity';

import { SummaryRoleView } from '../../domain/views/summary-role.view';

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
      entities: [Organization, Role, User, SummaryRoleView],
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
