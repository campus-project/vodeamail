import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { MailerModule as NMailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    NMailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return configService.getMailerConfig();
      },
    }),
  ],
})
export class MailerModule {}
