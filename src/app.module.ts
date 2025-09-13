import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './features/auth/auth.module';
import { EventsModule } from './features/events/events.module';
import { BookingsModule } from './features/bookings/bookings.module';
import { DatabaseModule } from './shared/database/database.module';
import { LoggerModule } from './shared/logger/logger.module';
import { ExceptionsModule } from './shared/exceptions/exceptions.module';
import { ValidationModule } from './shared/validation/validation.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Корневой модуль приложения
 * Импортирует все необходимые модули и настраивает приложение
 */
@Module({
  imports: [
    // Ограничение частоты запросов (rate limiting)
    // ttl задаётся в секундах (например, 60), limit - количество запросов
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: accept simple config object for throttler
    ThrottlerModule.forRoot({ ttl: 60, limit: 10 }),

    // Общие модули
    DatabaseModule,
    LoggerModule,
    ExceptionsModule,
    ValidationModule,

    // Модули функциональности
    AuthModule,
    EventsModule,
    BookingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Регистрируем глобальный ThrottlerGuard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
