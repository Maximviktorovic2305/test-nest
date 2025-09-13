import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { WinstonLoggerService } from '../logger/winston-logger.service';

// Фильтр перехвата всех исключений и формирования стандартизированного ответа
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  // Сервис логирования для записи информации об исключениях
  constructor(private readonly logger: WinstonLoggerService) {}

  // Обработка исключения (exception) и контекста хоста (host)
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Определяем статус HTTP ответа
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Определяем сообщение об ошибке
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Внутренняя ошибка сервера';

    // Логируем исключение
    const stackTrace =
      exception instanceof Error ? exception.stack : 'Нет стек трейса';
    this.logger.error(
      `Исключение: ${JSON.stringify(message)}`,
      stackTrace || 'Нет стек трейса',
    );

    // Отправляем стандартизированный ответ клиенту
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
