import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Вызываем родительский метод canActivate
    const result = (await super.canActivate(context)) as boolean;

    if (result) {
      // Получаем токен из заголовка Authorization
      const request = context.switchToHttp().getRequest();
      const token = request.headers.authorization?.replace('Bearer ', '');

      if (token) {
        // Проверяем, находится ли токен в черном списке
        const isBlacklisted = await this.authService.isTokenBlacklisted(token);
        if (isBlacklisted) {
          throw new UnauthorizedException('Токен был отозван');
        }
      }
    }

    return result;
  }

  handleRequest(err: any, user: any): any {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
