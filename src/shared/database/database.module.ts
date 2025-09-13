import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Модуль базы данных
 * Предоставляет сервис для работы с базой данных через Prisma
 */
@Module({
  // Регистрируем сервис Prisma как провайдер
  providers: [PrismaService],
  // Экспортируем сервис для использования в других модулях
  exports: [PrismaService],
})
export class DatabaseModule {}
