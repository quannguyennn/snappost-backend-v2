import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLContext } from 'src/graphql/app.graphql-context';
import { User } from 'src/modules/users/entities/users.entity';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const ctx: GraphQLContext = GqlExecutionContext.create(context).getContext();
    const userRoles = (<User>ctx.req?.user)?.roles;
    if (!roles || !userRoles) return true;
    for (const role of roles) if (userRoles.indexOf(role) >= 0) return true;
    return false;
  }
}
