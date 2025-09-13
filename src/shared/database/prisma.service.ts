import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Сервис для работы с базой данных через Prisma
 * Расширяет PrismaClient и реализует жизненный цикл NestJS
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  /**
   * Метод инициализации модуля
   * Подключается к базе данных при запуске приложения
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Метод включения хуков завершения работы
   * Закрывает соединение с базой данных при завершении приложения
   * @param app Экземпляр NestJS приложения
   */
  enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', () => {
      void app.close();
    });
  }
}
