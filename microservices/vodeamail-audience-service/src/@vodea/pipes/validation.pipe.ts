import {
  BadRequestException,
  HttpStatus,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common';
import { ValidationPipeOptions } from '@nestjs/common/pipes/validation.pipe';

export class ValidationPipe extends NestValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({
      exceptionFactory: (errors) => {
        const errorMessages: { [key: string]: string[] } = {};
        errors.forEach((error) => {
          errorMessages[error.property] = Object.values(error.constraints);
        });

        return new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: errorMessages,
          error: 'Bad Request',
        });
      },
      ...options,
    });
  }
}
