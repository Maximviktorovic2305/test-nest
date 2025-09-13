import { Injectable } from '@nestjs/common';
import { createLogger, format, transports, Logger } from 'winston';
import * as path from 'path';

/**
 * Сервис логирования на основе Winston
 * Предоставляет методы для логирования различных уровней сообщений
 */
@Injectable()
export class WinstonLoggerService {
  // Экземпляр логгера Winston
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

  /**
   * Метод для логирования информационных сообщений
   * @param message Текст сообщения
   */
  log(message: string) {
    this.logger.info(message);
  }

  /**
   * Метод для логирования ошибок
   * @param message Текст ошибки
   * @param trace Стек вызовов
   */
  error(message: string, trace: string) {
    this.logger.error(message, { trace });
  }

  /**
   * Метод для логирования предупреждений
   * @param message Текст предупреждения
   */
  warn(message: string) {
    this.logger.warn(message);
  }

  /**
   * Метод для логирования отладочных сообщений
   * @param message Текст отладочного сообщения
   */
  debug(message: string) {
    this.logger.debug(message);
  }

  /**
   * Метод для логирования подробных сообщений
   * @param message Текст подробного сообщения
   */
  verbose(message: string) {
    this.logger.verbose(message);
  }
}
