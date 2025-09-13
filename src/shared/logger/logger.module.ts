import { Module } from '@nestjs/common';
import { WinstonLoggerService } from './winston-logger.service';

/**
 * Модуль логирования
 * Предоставляет сервис для логирования через Winston
 */
@Module({
  // Регистрируем сервис логирования как провайдер
  providers: [WinstonLoggerService],
  // Экспортируем сервис для использования в других модулях
  exports: [WinstonLoggerService],
})
export class LoggerModule {}
