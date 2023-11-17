import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { META_ROLES } from '../../../auth/decorators';
import { User } from '../../../users/entities';
import { ValidRoles } from '../../../auth/interfaces/valid-roles';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRole: string = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );

    if (!validRole) return true;
    if (validRole.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as User;
    console.log(user);
    if (!user) throw new BadRequestException('User not found');

    /* for (const role of user.userType) {
      if (validRoles.includes(role)) {
        return true;
      }
    } */

    console.log(user.userType);

    if (validRole.includes(user.userType)) {
      console.log('El usuario es minorista');
      return true;
    }

    throw new ForbiddenException(
      `User ${user.fullName} need a valid role: [${validRole}]`,
    );
  }
}
