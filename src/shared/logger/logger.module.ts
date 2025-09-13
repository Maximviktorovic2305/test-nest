import { Module } from '@nestjs/common';
import { WinstonLoggerService } from './winston-logger.service';

// Модуль логирования — предоставляет Winston-сервис
@Module({
  // Регистрируем сервис логирования как провайдер
  providers: [WinstonLoggerService],
  // Экспортируем сервис для использования в других модулях
  exports: [WinstonLoggerService],
})
export class LoggerModule {}
