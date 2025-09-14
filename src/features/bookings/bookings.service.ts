import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  InsufficientSeatsException,
  BookingNotFoundException,
  EventNotFoundException,
  UnauthorizedBookingException,
} from '../../shared/exceptions/business.exception';
import { NotificationProcessor } from '../../shared/queue/notification.processor';

@Injectable()
export class BookingsService {
  // Сервис Prisma для доступа к БД
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationProcessor: NotificationProcessor,
  ) {}

  // Создает бронирование для пользователя
  async create(userId: number, createBookingDto: CreateBookingDto) {
    const { eventId, seats } = createBookingDto;

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new EventNotFoundException();
    }

    // Быстрая проверка свободных мест
    if (event.bookedSeats + seats > event.totalSeats) {
      throw new InsufficientSeatsException(
        `Доступно только ${event.totalSeats - event.bookedSeats} мест`,
      );
    }

    // Атомарная транзакция: условно увеличиваем bookedSeats и создаём бронирование
    const booking = await this.prisma.$transaction(async (tx) => {
      const updateResult = await tx.event.updateMany({
        where: {
          id: eventId,
          bookedSeats: {
            lte: event.totalSeats - seats,
          },
        },
        data: {
          bookedSeats: {
            increment: seats,
          },
        },
      });

      if (updateResult.count === 0) {
        throw new InsufficientSeatsException(
          `Доступно только ${event.totalSeats - event.bookedSeats} мест`,
        );
      }

      const created = await tx.booking.create({
        data: {
          userId,
          eventId,
          seats,
        },
      });

      return created;
    });

    // Отправляем уведомление о создании бронирования
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      await this.notificationProcessor.queueNotification({
        userId,
        message: `Ваше бронирование на событие "${event.title}" успешно создано на ${seats} мест(а).`,
        type: 'email',
        recipient: user.email,
      });
    }

    return booking;
  }

  // Получает все бронирования для пользователя или для администратора
  async findAll(userId: number, userRole: string) {
    const where = userRole === 'admin' ? {} : { userId };

    return this.prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Метод получения бронирования по ID
  async findOne(userId: number, userRole: string, id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
          },
        },
      },
    });

    if (!booking) {
      throw new BookingNotFoundException();
    }

    if (userRole !== 'admin' && booking.userId !== userId) {
      throw new UnauthorizedBookingException();
    }

    return booking;
  }

  // Отменяет бронирование
  async cancel(userId: number, userRole: string, id: number) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      throw new BookingNotFoundException();
    }

    if (userRole !== 'admin' && booking.userId !== userId) {
      throw new UnauthorizedBookingException();
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.booking.updateMany({
        where: { id, status: { not: 'cancelled' } },
        data: { status: 'cancelled' },
      });

      if (updated.count === 0) {
        throw new BookingNotFoundException();
      }

      await tx.event.update({
        where: { id: booking.eventId },
        data: { bookedSeats: { decrement: booking.seats } },
      });

      return tx.booking.findUnique({ where: { id } });
    });

    // Отправляем уведомление об отмене бронирования
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      const event = await this.prisma.event.findUnique({
        where: { id: booking.eventId },
      });

      if (event) {
        await this.notificationProcessor.queueNotification({
          userId,
          message: `Ваше бронирование на событие "${event.title}" было отменено.`,
          type: 'email',
          recipient: user.email,
        });
      }
    }

    return result;
  }
}
