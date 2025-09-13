import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Express } from 'express';
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
  it('/ (GET)', async () => {
    await request(app.getHttpServer() as unknown as Express)
      .get('/')
      .expect(200)
      .expect(
        'Welcome to the Event Booking API! Visit /api for documentation.',
      );
  });
});
