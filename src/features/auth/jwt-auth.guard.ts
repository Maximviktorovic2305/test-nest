import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Добавьте вашу пользовательскую логику аутентификации здесь
    // например, вызовите super.logIn(request) для установки сессии.
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any): any {
    // Вы можете выбросить исключение на основе аргументов "info" или "err"
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
