import { Module, Provider } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientProxyFactory } from '@nestjs/microservices';
import { ConfigService } from '../infrastructure/config/config.service';
import { SentEmail } from './entities/sent-email.entity';
import { SentEmailClick } from './entities/sent-email-click.entity';
import { SentEmailService } from './services/sent-email.service';

const providers: Provider[] = [
  {
    provide: 'REDIS_TRANSPORT',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) =>
      ClientProxyFactory.create(configService.getRedisConfig()),
  },
  {
    provide: 'MAILER_SENT_EMAIL_SERVICE',
    useClass: SentEmailService,
  },
];

@Module({
  imports: [
    InfrastructureModule,
    TypeOrmModule.forFeature([SentEmail, SentEmailClick]),
  ],
  providers: [...providers],
  exports: [...providers],
})
export class DomainModule {}
