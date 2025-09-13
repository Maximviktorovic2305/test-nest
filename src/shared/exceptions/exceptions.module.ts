import { Module } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { LoggerModule } from '../logger/logger.module';

/**
 * Модуль обработки исключений
 * Предоставляет фильтр для обработки всех исключений в приложении
 */
@Module({
  // Импортируем модуль логирования для записи информации об исключениях
  imports: [LoggerModule],
  // Регистрируем фильтр исключений как провайдер
  providers: [AllExceptionsFilter],
  // Экспортируем фильтр для использования в других модулях
  exports: [AllExceptionsFilter],
})
export class ExceptionsModule {}
