import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { environment } from '../../shared/config/environment';
import { JwtPayload } from '../../types/auth.types';

// Стратегия JWT — проверяет токен и извлекает полезную нагрузку
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: environment.jwtSecret,
    };

    super(options);
  }

  // Валидирует payload JWT и возвращает объект пользователя
  async validate(payload: JwtPayload) {
    // Добавляем небольшую задержку, чтобы сделать метод асинхронным
    await Promise.resolve();
    // Возвращаем объект с пользовательскими данными
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
