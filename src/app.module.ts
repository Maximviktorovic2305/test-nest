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
import { RedisModule } from './shared/redis/redis.module';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { QueueModule } from './shared/queue/queue.module';
import { environment } from './shared/config/environment';

// Корневой модуль приложения — собирает и настраивает все модули
@Module({
  imports: [
    // Ограничение частоты запросов (rate limiting)
    // ttl задаётся в секундах (например, 60), limit - количество запросов
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [{ limit: 10, ttl: 60 }],
        storage: new ThrottlerStorageRedisService({
          host: environment.redisHost,
          port: environment.redisPort,
        }),
      }),
    }),

    // Общие модули
    DatabaseModule,
    LoggerModule,
    ExceptionsModule,
    ValidationModule,
    RedisModule,
    QueueModule,

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
