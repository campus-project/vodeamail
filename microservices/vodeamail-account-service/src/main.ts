import { NestFactory, Reflector } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, Logger } from '@nestjs/common';
import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository,
} from 'typeorm-transactional-cls-hooked';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from './infrastructure/config/config.service';
import { ExceptionRpcFilter, ValidationRpcPipe } from 'vnest-core';

initializeTransactionalContext();
patchTypeORMRepositoryWithBaseRepository();

(async function () {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    new ConfigService().getRedisConfig(),
  );

  //is used for transform validation message
  app.useGlobalPipes(new ValidationRpcPipe());

  // is use for transform exception to rpc exception
  app.useGlobalFilters(new ExceptionRpcFilter());

  //is used for exclude attribute in entity
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  //is used for allow custom validation attribute
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(() => new Logger('Main').log(`Microservices started...`));
})();
