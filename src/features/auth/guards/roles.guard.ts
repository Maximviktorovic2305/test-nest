import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedRequest } from '../../../types/auth.types';

// Гвард для проверки ролей пользователя — проверяет права доступа по ролям
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  // Проверяет, имеет ли пользователь одну из требуемых ролей
  canActivate(context: ExecutionContext): boolean {
    // Получаем необходимые роли из метаданных
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Если роли не требуются, разрешаем доступ
    if (!requiredRoles) {
      return true;
    }

    // Получаем объект запроса и пользователя
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request?.user;

    // Если пользователь не аутентифицирован, запрещаем доступ
    if (!user) return false;

    // Проверяем, есть ли у пользователя одна из необходимых ролей
    return requiredRoles.some((role) => user.role === role);
  }
}
