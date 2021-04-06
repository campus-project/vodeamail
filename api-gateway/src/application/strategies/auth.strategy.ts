import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY, PERMISSION_KEY } from '../../@vodea/decorators';

@Injectable()
export class AuthStrategy extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const permission = this.reflector.getAllAndOverride<boolean>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (permission) {
      //todo: validate permission
      return permission;
    }

    return super.canActivate(context);
  }
}
