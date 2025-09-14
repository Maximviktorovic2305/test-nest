import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { DatabaseModule } from '../../shared/database/database.module';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../../shared/redis/redis.module';

// Модуль событий — регистрирует контроллер и сервис событий
@Module({
  imports: [
    // Модуль для работы с базой данных
    DatabaseModule,
    // Модуль аутентификации для защиты маршрутов
    AuthModule,
    // Модуль Redis для кэширования
    RedisModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
  // Экспортируем сервис для использования в других модулях
  exports: [EventsService],
})
export class EventsModule {}
