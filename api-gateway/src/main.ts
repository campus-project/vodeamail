import { NestFactory, Reflector } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';
import { ConfigService } from './infrastructure/config/config.service';
import { ClassSerializerInterceptor } from '@nestjs/common';
import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository,
} from 'typeorm-transactional-cls-hooked';
import { ValidationPipe } from 'vnest-core';

initializeTransactionalContext();
patchTypeORMRepositoryWithBaseRepository();

(async function () {
  const configService = new ConfigService();
  const { host, port } = configService.getHostPort();

  const app = await NestFactory.create(AppModule, new ExpressAdapter(), {
    cors: true,
  });

  //is used for transform validation message
  app.useGlobalPipes(new ValidationPipe());

  //is used for exclude attribute in entity
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  //is used for allow custom validation attribute
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.use(helmet());
  app.use(rateLimit({ windowMs: 60 * 1000, max: 1000 }));

  await app.listen(port, host);
})();
