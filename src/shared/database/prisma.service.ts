import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Сервис работы с БД (Prisma) — расширяет PrismaClient и управляет lifecycle
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // Инициализация модуля: подключение к базе данных
  async onModuleInit() {
    await this.$connect();
  }

  // Включает hook для корректного завершения приложения (закрывает соединение)
  enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', () => {
      void app.close();
    });
  }
}
