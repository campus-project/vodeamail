import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [ConfigModule, DatabaseModule, MailerModule],
  exports: [ConfigModule, DatabaseModule, MailerModule],
})
export class InfrastructureModule {}
