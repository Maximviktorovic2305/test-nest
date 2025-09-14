import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Express } from 'express';
import { PrismaService } from './../src/shared/database/prisma.service';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';

// Проверяет функциональность корневого контроллера приложения через HTTP запросы
describe('AppController (e2e)', () => {
  let app: INestApplication;

  // Подготовка приложения перед каждым тестом
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    })
      .overrideProvider(PrismaService)
      .useValue({ $connect: async () => {}, $disconnect: async () => {} })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // Тест проверяет, что корневой маршрут возвращает приветственное сообщение
  it('/ (GET)', async () => {
    await request(app.getHttpServer() as unknown as Express)
      .get('/')
      .expect(200)
      .expect(
        'Welcome to the Event Booking API! Visit /api for documentation.',
      );
  });
});
