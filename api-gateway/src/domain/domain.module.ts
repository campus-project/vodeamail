import { Module, Provider } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientProxyFactory } from '@nestjs/microservices';
import { VodeaCloudService } from './services/vodea-cloud.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '../infrastructure/config/config.service';
import { ConfigModule } from '../infrastructure/config/config.module';
import { RefreshTokenService } from './services/refresh-token.service';
import { JwtService } from './services/jwt.service';
import { TransactionService } from './services/transaction.service';

import { RefreshToken } from './entities/refresh-token.entity';
import { Transaction } from './entities/transaction.entity';
import { Permission } from './entities/permission.entity';
import { GateSetting } from './entities/gate-setting.entity';
import { GateSettingPermission } from './entities/gate-setting-permission.entity';
import { GateSettingService } from './services/gate-setting.service';
import { PermissionService } from './services/permission.service';
import { RolePermissionView } from './views/role-permission.view';

const providers: Provider[] = [
  {
    provide: 'REDIS_TRANSPORT',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) =>
      ClientProxyFactory.create(configService.getRedisConfig()),
  },
  {
    provide: 'VODEA_CLOUD_SERVICE',
    useClass: VodeaCloudService,
  },
  {
    provide: 'JWT_SERVICE',
    useClass: JwtService,
  },
  {
    provide: 'AUTH_REFRESH_TOKEN_SERVICE',
    useClass: RefreshTokenService,
  },
  {
    provide: 'AUTH_TRANSACTION_SERVICE',
    useClass: TransactionService,
  },
  {
    provide: 'AUTH_GATE_SETTING_SERVICE',
    useClass: GateSettingService,
  },
  {
    provide: 'AUTH_PERMISSION_SERVICE',
    useClass: PermissionService,
  },
];

@Module({
  imports: [
    InfrastructureModule,
    TypeOrmModule.forFeature([
      RefreshToken,
      Transaction,
      Permission,
      GateSetting,
      GateSettingPermission,

      RolePermissionView,
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return configService.getJwtConfig();
      },
      inject: [ConfigService],
    }),
  ],
  providers: [...providers],
  exports: [...providers],
})
export class DomainModule {}
