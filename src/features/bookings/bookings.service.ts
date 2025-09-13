import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  InsufficientSeatsException,
  BookingNotFoundException,
  EventNotFoundException,
  UnauthorizedBookingException,
} from '../../shared/exceptions/business.exception';

/**
 * Сервис бронирований
 * Содержит бизнес-логику для работы с бронированиями
 */
@Injectable()
export class BookingsService {
  constructor(
    // Сервис для работы с базой данных через Prisma
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Метод создания нового бронирования
   * @param userId ID пользователя, создающего бронирование
   * @param createBookingDto Данные для создания бронирования
   * @returns Созданное бронирование
   * @throws EventNotFoundException если событие не найдено
   * @throws InsufficientSeatsException если недостаточно свободных мест
   */
  async create(userId: number, createBookingDto: CreateBookingDto) {
    const { eventId, seats } = createBookingDto;

    // Проверяем существование события
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new EventNotFoundException();
    }

    // Проверяем наличие достаточного количества свободных мест
    if (event.bookedSeats + seats > event.totalSeats) {
      throw new InsufficientSeatsException(
        `Доступно только ${event.totalSeats - event.bookedSeats} мест`,
      );
    }

    // Создаем бронирование
    const booking = await this.prisma.booking.create({
      data: {
        userId,
        eventId,
        seats,
      },
    });

    // Обновляем количество забронированных мест в событии
    await this.prisma.event.update({
      where: { id: eventId },
      data: {
        bookedSeats: {
          increment: seats,
        },
      },
    });

    return booking;
  }

  /**
   * Метод получения всех бронирований
   * @param userId ID пользователя
   * @param userRole Роль пользователя
   * @returns Массив бронирований
   */
  async findAll(userId: number, userRole: string) {
    // Администраторы могут видеть все бронирования, обычные пользователи - только свои
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

  /**
   * Метод получения бронирования по ID
   * @param userId ID пользователя
   * @param userRole Роль пользователя
   * @param id ID бронирования
   * @returns Найденное бронирование
   * @throws BookingNotFoundException если бронирование не найдено
   * @throws UnauthorizedBookingException если пользователь не авторизован для просмотра
   */
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

    // Проверяем, авторизован ли пользователь для доступа к этому бронированию
    if (userRole !== 'admin' && booking.userId !== userId) {
      throw new UnauthorizedBookingException();
    }

    return booking;
  }

  /**
   * Метод отмены бронирования
   * @param userId ID пользователя
   * @param userRole Роль пользователя
   * @param id ID бронирования для отмены
   * @returns Обновленное бронирование
   * @throws BookingNotFoundException если бронирование не найдено
   * @throws UnauthorizedBookingException если пользователь не авторизован для отмены
   */
  async cancel(userId: number, userRole: string, id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new BookingNotFoundException();
    }

    // Проверяем, авторизован ли пользователь для отмены этого бронирования
    if (userRole !== 'admin' && booking.userId !== userId) {
      throw new UnauthorizedBookingException();
    }

    // Обновляем статус бронирования на "отменено"
    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: 'cancelled',
      },
    });

    // Обновляем количество забронированных мест в событии
    await this.prisma.event.update({
      where: { id: booking.eventId },
      data: {
        bookedSeats: {
          decrement: booking.seats,
        },
      },
    });

    return updatedBooking;
  }
}
