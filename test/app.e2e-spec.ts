import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

/**
 * E2E тесты для AppController
 * Проверяет функциональность корневого контроллера приложения через HTTP запросы
 */
describe('AppController (e2e)', () => {
  let app: INestApplication;

  /**
   * Подготовка приложения перед каждым тестом
   */
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  /**
   * Тест проверяет, что корневой маршрут возвращает приветственное сообщение
   */
  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect(
        'Welcome to the Event Booking API! Visit /api for documentation.',
      );
  });
});
