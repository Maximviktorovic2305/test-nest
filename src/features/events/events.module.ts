import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { DatabaseModule } from '../../shared/database/database.module';
import { AuthModule } from '../auth/auth.module';

/**
 * Модуль событий
 * Содержит все необходимые компоненты для работы с событиями
 */
@Module({
  imports: [
    // Модуль для работы с базой данных
    DatabaseModule,
    // Модуль аутентификации для защиты маршрутов
    AuthModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
  // Экспортируем сервис для использования в других модулях
  exports: [EventsService],
})
export class EventsModule {}
