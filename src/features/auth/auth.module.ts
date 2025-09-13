import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { DatabaseModule } from '../../shared/database/database.module';
import { environment } from '../../shared/config/environment';

/**
 * Модуль аутентификации
 * Содержит все необходимые компоненты для работы с аутентификацией и авторизацией
 */
@Module({
  imports: [
    // Модуль для работы с базой данных
    DatabaseModule,
    // Модуль JWT для работы с токенами
    JwtModule.register({
      // Секретный ключ для подписи токенов
      secret: environment.jwtSecret,
      // Опции подписи токенов
      signOptions: { expiresIn: environment.jwtExpiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  // Экспортируем сервисы для использования в других модулях
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
