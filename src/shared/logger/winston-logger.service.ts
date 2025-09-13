import { Injectable } from '@nestjs/common';
import { createLogger, format, transports, Logger } from 'winston';
import * as path from 'path';

// Сервис логирования (Winston) — методы для разных уровней логов
@Injectable()
export class WinstonLoggerService {
  // Экземпляр Winston логгера
  private logger: Logger;

  constructor() {
    this.logger = createLogger({
      // Уровень логирования по умолчанию
      level: 'info',
      // Формат логов
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
      ),
      // Метаданные по умолчанию
      defaultMeta: { service: 'event-booking-service' },
      // Транспорты для записи логов
      transports: [
        // Файл для ошибок
        new transports.File({
          filename: path.join(process.cwd(), 'logs', 'error.log'),
          level: 'error',
        }),
        // Общий файл для всех логов
        new transports.File({
          filename: path.join(process.cwd(), 'logs', 'combined.log'),
        }),
      ],
    });

    // Если мы не в production, также логируем в консоль
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new transports.Console({
          format: format.combine(format.colorize(), format.simple()),
        }),
      );
    }
  }

  // Логирование информационных сообщений
  // message — текст сообщения
  log(message: string) {
    this.logger.info(message);
  }

  // Логирование ошибок
  // message — текст ошибки, trace — стек вызовов
  error(message: string, trace: string) {
    this.logger.error(message, { trace });
  }

  // Логирование предупреждений
  warn(message: string) {
    this.logger.warn(message);
  }

  // Логирование отладочных сообщений
  debug(message: string) {
    this.logger.debug(message);
  }

  // Логирование подробных сообщений
  verbose(message: string) {
    this.logger.verbose(message);
  }
}
