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

/**
 * Корневой модуль приложения
 * Импортирует все необходимые модули и настраивает приложение
 */
@Module({
  imports: [
    // Ограничение частоты запросов (rate limiting)
    ThrottlerModule.forRoot([
      {
        // Время жизни токена в миллисекундах (1 минута)
        ttl: 60000,
        // Максимальное количество запросов за период времени
        limit: 10,
      },
    ]),

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
  providers: [AppService],
})
export class AppModule {}
