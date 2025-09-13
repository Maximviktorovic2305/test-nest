import { Module } from '@nestjs/common';
import { ValidationPipe } from './validation.pipe';

// Модуль валидации — предоставляет ValidationPipe для использования в приложении
@Module({
  // Регистрируем пайп валидации как провайдер
  providers: [ValidationPipe],
  // Экспортируем пайп для использования в других модулях
  exports: [ValidationPipe],
})
export class ValidationModule {}
