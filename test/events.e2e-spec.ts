import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Express } from 'express';
import { EventsModule } from './../src/features/events/events.module';
import { PrismaService } from '../src/shared/database/prisma.service';
import { DatabaseModule } from '../src/shared/database/database.module';
import { JwtAuthGuard } from '../src/features/auth/guards/jwt-auth.guard';

/**
 * E2E тесты для EventsController
 * Проверяет функциональность контроллера событий через HTTP запросы
 */
describe('EventsController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  /**
   * Подготовка приложения и сервисов перед всеми тестами
   */
  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [DatabaseModule, EventsModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: async () => {},
        $disconnect: async () => {},
        event: { findMany: () => [] },
      });

    // override JwtAuthGuard to allow requests in e2e tests
    const moduleFixture: TestingModule = await moduleBuilder
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  /**
   * Закрытие соединений после всех тестов
   */
  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  /**
   * Тест проверяет, что маршрут получения всех событий возвращает пустой массив
   */
  it('/events (GET)', async () => {
    await request(app.getHttpServer() as unknown as Express)
      .get('/events')
      .expect(200)
      .expect([]);
  });
});
