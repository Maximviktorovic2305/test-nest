import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventNotFoundException } from '../../shared/exceptions/business.exception';
import { CacheService } from '../../shared/redis/cache.service';

// Сервис событий — содержит бизнес-логику для работы с событиями
@Injectable()
export class EventsService {
  constructor(
    // Сервис для работы с базой данных через Prisma
    private readonly prisma: PrismaService,
    // Сервис для работы с кэшем через Redis
    private readonly cacheService: CacheService,
  ) {}

  // Создает новое событие
  async create(createEventDto: CreateEventDto) {
    // Очищаем кэш при создании нового события
    await this.cacheService.delete('all_events');
    return this.prisma.event.create({
      data: createEventDto,
    });
  }

  // Получает все события, отсортированные по дате
  async findAll() {
    // Пытаемся получить данные из кэша
    const cachedEvents = await this.cacheService.get('all_events');
    if (cachedEvents) {
      return cachedEvents;
    }

    // Если в кэше нет данных, получаем из базы
    const events = await this.prisma.event.findMany({
      orderBy: {
        date: 'asc',
      },
    });

    // Сохраняем данные в кэш на 5 минут
    await this.cacheService.set('all_events', events, 300);

    return events;
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
      // Очищаем кэш при обновлении события
      await this.cacheService.delete('all_events');
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
      // Очищаем кэш при удалении события
      await this.cacheService.delete('all_events');
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
