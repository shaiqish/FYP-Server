import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InsufficientPermissionsException } from 'src/common/exceptions/custom.exception';

/**
 * Role-based Access Control Guard
 * Checks if user has required roles to access protected endpoints
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new InsufficientPermissionsException('User not authenticated');
    }

    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles || roles.length === 0) {
      return true;
    }

    if (!user.role || !roles.includes(user.role)) {
      throw new InsufficientPermissionsException(
        `User role '${user.role}' does not have required permissions. Required: ${roles.join(', ')}`,
      );
    }

    return true;
  }
}
