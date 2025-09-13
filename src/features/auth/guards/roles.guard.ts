import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedRequest } from '../../../types/auth.types';

/**
 * Гвард для проверки ролей пользователя
 * Проверяет, имеет ли пользователь необходимые роли для доступа к маршруту
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Метод проверки доступа на основе ролей
   * @param context Контекст выполнения
   * @returns true если доступ разрешен, false если запрещен
   */
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
