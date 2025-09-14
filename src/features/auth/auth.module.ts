import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { DatabaseModule } from '../../shared/database/database.module';
import { environment } from '../../shared/config/environment';
import { RedisModule } from '../../shared/redis/redis.module';

// Модуль аутентификации — JWT + сервис аутентификации и стратегия
@Module({
  imports: [
    // Модуль для работы с базой данных
    DatabaseModule,
    // Модуль Redis для работы с черным списком токенов
    RedisModule,
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
