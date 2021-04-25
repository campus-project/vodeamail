import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY, PERMISSION_KEY } from 'vnest-core';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class AuthStrategy extends AuthGuard('jwt') {
  private permission;

  constructor(private reflector: Reflector) {
    super();
  }

  authenticate() {
    console.log('asd');
  }

  handleRequest(err, user) {
    if (!this.permission || user?.role?.is_special) {
      return user;
    }

    const userPermissions = user?.permissions || [];
    if (userPermissions.includes(this.permission)) {
      return user;
    }

    throw new ForbiddenException();
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
      this.permission = permission;
    }

    return super.canActivate(context);
  }
}
