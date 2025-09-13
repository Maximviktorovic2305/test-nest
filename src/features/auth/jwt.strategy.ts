import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { environment } from '../../shared/config/environment';
import { JwtPayload } from '../../types';

/**
 * Стратегия JWT аутентификации
 * Используется для проверки JWT токенов и извлечения пользовательских данных
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      // Извлекаем JWT токен из заголовка Authorization
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Не игнорируем срок действия токена
      ignoreExpiration: false,
      // Секретный ключ для проверки подписи токена
      secretOrKey: environment.jwtSecret,
    });
  }

  /**
   * Метод валидации JWT токена
   * Вызывается после успешной проверки подписи токена
   * @param payload Данные из JWT токена
   * @returns Объект с пользовательскими данными
   */
  async validate(payload: JwtPayload) {
    // Добавляем небольшую задержку, чтобы сделать метод асинхронным
    await Promise.resolve();
    // Возвращаем объект с пользовательскими данными
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
