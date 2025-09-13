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
// Throttler is intentionally not imported here to avoid typing mismatches in this environment.
// Per-route throttling can be enabled in controllers once typings are aligned.

/**
 * Корневой модуль приложения
 * Импортирует все необходимые модули и настраивает приложение
 */
@Module({
  imports: [
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
    // дополнительные провайдеры (guards и т.д.)
  ],
})
export class AppModule {}
