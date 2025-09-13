import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventNotFoundException } from '../../shared/exceptions/business.exception';

/**
 * Сервис событий
 * Содержит бизнес-логику для работы с событиями
 */
@Injectable()
export class EventsService {
  constructor(
    // Сервис для работы с базой данных через Prisma
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Метод создания нового события
   * @param createEventDto Данные для создания события
   * @returns Созданное событие
   */
  async create(createEventDto: CreateEventDto) {
    return this.prisma.event.create({
      data: createEventDto,
    });
  }

  /**
   * Метод получения всех событий
   * @returns Массив всех событий, отсортированных по дате
   */
  async findAll() {
    return this.prisma.event.findMany({
      orderBy: {
        date: 'asc',
      },
    });
  }

  /**
   * Метод получения события по ID
   * @param id ID события
   * @returns Найденное событие
   * @throws EventNotFoundException если событие не найдено
   */
  async findOne(id: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new EventNotFoundException();
    }

    return event;
  }

  /**
   * Метод обновления события
   * @param id ID события для обновления
   * @param updateEventDto Данные для обновления события
   * @returns Обновленное событие
   * @throws EventNotFoundException если событие не найдено
   */
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

  /**
   * Метод удаления события
   * @param id ID события для удаления
   * @returns Удаленное событие
   * @throws EventNotFoundException если событие не найдено
   */
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
