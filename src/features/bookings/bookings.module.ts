import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { DatabaseModule } from '../../shared/database/database.module';
import { AuthModule } from '../auth/auth.module';

/**
 * Модуль бронирований
 * Содержит все необходимые компоненты для работы с бронированиями
 */
@Module({
  imports: [
    // Модуль для работы с базой данных
    DatabaseModule,
    // Модуль аутентификации для защиты маршрутов
    AuthModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  // Экспортируем сервис для использования в других модулях
  exports: [BookingsService],
})
export class BookingsModule {}
