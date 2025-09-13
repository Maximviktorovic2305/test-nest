import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventNotFoundException } from '../../shared/exceptions/business.exception';

// Сервис событий — содержит бизнес-логику для работы с событиями
@Injectable()
export class EventsService {
  constructor(
    // Сервис для работы с базой данных через Prisma
    private readonly prisma: PrismaService,
  ) {}

  // Создает новое событие
  async create(createEventDto: CreateEventDto) {
    return this.prisma.event.create({
      data: createEventDto,
    });
  }

  // Получает все события, отсортированные по дате
  async findAll() {
    return this.prisma.event.findMany({
      orderBy: {
        date: 'asc',
      },
    });
  }

  // Получает событие по ID
  async findOne(id: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new EventNotFoundException();
    }

    return event;
  }

  // Обновляет событие по ID
  async update(id: number, updateEventDto: UpdateEventDto) {
    try {
      return await this.prisma.event.update({
        where: { id },
        data: updateEventDto,
      });
    } catch (error: unknown) {
      // Если событие не найдено, выбрасываем соответствующее исключение
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new EventNotFoundException();
      }
      throw error;
    }
  }

  // Удаляет событие по ID
  async remove(id: number) {
    try {
      return await this.prisma.event.delete({
        where: { id },
      });
    } catch (error: unknown) {
      // Если событие не найдено, выбрасываем соответствующее исключение
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new EventNotFoundException();
      }
      throw error;
    }
  }
}
