import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from '../../../auth/decorators/role-protected.decorator';
import { User } from '../../../users/entities';

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

    if (!user) throw new BadRequestException('User not found');

    if (validRole[0] === user.userType) return true;

    // for (const role of user.curp) {
    //   if (validRoles.includes(role)) return true;
    // }

    throw new ForbiddenException(`User ${user.fullName} need a valid role`);
  }
}
