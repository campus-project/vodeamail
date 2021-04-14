import { Module, Provider } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientProxyFactory } from '@nestjs/microservices';
import { VodeaCloudService } from './services/vodea-cloud.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokenService } from './services/refresh-token.service';
import { JwtService } from './services/jwt.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '../infrastructure/config/config.service';
import { ConfigModule } from '../infrastructure/config/config.module';

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
];

@Module({
  imports: [
    InfrastructureModule,
    TypeOrmModule.forFeature([RefreshToken]),
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
