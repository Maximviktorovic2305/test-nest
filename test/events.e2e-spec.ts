import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { EventsModule } from './../src/features/events/events.module';
import { PrismaService } from '../src/shared/database/prisma.service';
import { DatabaseModule } from '../src/shared/database/database.module';

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
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, EventsModule],
    }).compile();

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
  it('/events (GET)', () => {
    return request(app.getHttpServer()).get('/events').expect(200).expect([]);
  });
});
