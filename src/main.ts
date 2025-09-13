import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './shared/exceptions/all-exceptions.filter';
import { WinstonLoggerService } from './shared/logger/winston-logger.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { environment } from './shared/config/environment';
import { PrismaService } from './shared/database/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Основная функция запуска приложения
 * Настраивает и запускает NestJS приложение
 */
async function bootstrap() {
  // Создаем директорию для логов, если она не существует
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const app = await NestFactory.create(AppModule);

  // Глобальный пайп валидации для проверки входных данных
  app.useGlobalPipes(
    new ValidationPipe({
      // Удалять свойства, не имеющие декораторов валидации
      whitelist: true,
      // Запрещать свойства, не имеющие декораторов валидации
      forbidNonWhitelisted: true,
      // Автоматически преобразовывать входные данные к типам
      transform: true,
    }),
  );

  // Глобальный фильтр исключений для обработки всех ошибок
  const logger = app.get(WinstonLoggerService);
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  // Включаем CORS для поддержки кросс-доменных запросов
  app.enableCors();

  // Настройка Swagger для документации API
  const config = new DocumentBuilder()
    .setTitle('API бронирования событий')
    .setDescription('API для бронирования событий и управления бронированиями')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Используем порт из конфигурации окружения
  const port = environment.port;
  await app.listen(port);

  logger.log(`Приложение запущено по адресу: http://localhost:${port}`);

  // Включаем хуки завершения работы для корректного закрытия соединений
  const prismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app);
}

// Запускаем приложение и обрабатываем возможные ошибки
bootstrap().catch((error) => {
  console.error('Не удалось запустить приложение:', error);
  process.exit(1);
});
