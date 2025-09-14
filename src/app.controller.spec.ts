import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Тесты для AppController
describe('AppController', () => {
  let appController: AppController;

  // Подготовка модуля тестирования перед каждым тестом
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  // Группа тестов для корневого маршрута
  describe('root', () => {
    // Тест проверяет, что корневой маршрут возвращает приветственное сообщение
    it('should return welcome message', () => {
      expect(appController.getHello()).toBe(
        'Welcome to the Event Booking API! Visit /api for documentation.',
      );
    });
  });
});
