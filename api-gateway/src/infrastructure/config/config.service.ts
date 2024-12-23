import { Injectable } from '@nestjs/common';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ClientOptions, Transport } from '@nestjs/microservices';
import { ConfigServiceAbstract } from 'vnest-core';

import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { Permission } from '../../domain/entities/permission.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import { GateSetting } from '../../domain/entities/gate-setting.entity';
import { GateSettingPermission } from '../../domain/entities/gate-setting-permission.entity';

import { RolePermissionView } from '../../domain/views/role-permission.view';

@Injectable()
export class ConfigService extends ConfigServiceAbstract {
  constructor() {
    super();
    super.init();
  }

  protected managedEnvKeys: string[] = [
    'APP_HOST',
    'APP_PORT',
    'APP_ENV',
    'DB_HOST',
    'DB_PORT',
    'DB_DATABASE',
    'DB_USERNAME',
    'DB_PASSWORD',
    'REDIS_URL',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'VODEA_CLOUD_CLIENT_ID',
    'VODEA_CLOUD_CLIENT_SECRET',
    'VODEA_CLOUD_TOKEN_URL',
    'VODEA_CLOUD_ACCOUNT_URL',
  ];

  getHostPort() {
    return {
      host: this.getValue('APP_HOST', true),
      port: this.getValue('APP_PORT', true),
    };
  }

  getVodeaCloudOauth2() {
    return {
      token_url: this.getValue('VODEA_CLOUD_TOKEN_URL', true),
      account_url: this.getValue('VODEA_CLOUD_ACCOUNT_URL', true),
      client_id: this.getValue('VODEA_CLOUD_CLIENT_ID', true),
      client_secret: this.getValue('VODEA_CLOUD_CLIENT_SECRET', true),
      grant_type: 'authorization_code',
    };
  }

  getJwtSecret() {
    return this.getValue('JWT_SECRET', true);
  }

  getJwtConfig() {
    return {
      secret: this.getJwtSecret(),
      signOptions: { expiresIn: this.getValue('JWT_EXPIRES_IN', true) },
    };
  }

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
        RefreshToken,
        Transaction,
        Permission,
        GateSetting,
        GateSettingPermission,

        RolePermissionView,
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
