import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  // Регистрируем сервис Prisma как провайдер
  providers: [PrismaService],
  // Экспортируем сервис для использования в других модулях
  exports: [PrismaService],
})
export class DatabaseModule {}
