import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import type { AuthenticatedRequest } from '../../types/auth.types';

/**
 * Контроллер бронирований
 * Обрабатывает HTTP запросы для работы с бронированиями
 */
@Controller('bookings')
// Применяем гвард аутентификации ко всем маршрутам
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(
    // Сервис для работы с бронированиями
    private readonly bookingsService: BookingsService,
  ) {}

  /**
   * Метод создания нового бронирования
   * @param req Объект запроса с данными пользователя
   * @param createBookingDto Данные для создания бронирования
   */
  @Post()
  @Throttle(5) // 5 requests per default ttl
  @UsePipes(new ValidationPipe({ transform: true }))
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    // ensure user is present
    if (!req.user) throw new Error('Unauthorized');
    return this.bookingsService.create(
      Number(req.user.userId),
      createBookingDto,
    );
  }

  /**
   * Метод получения всех бронирований пользователя
   * @param req Объект запроса с данными пользователя
   */
  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    if (!req.user) throw new Error('Unauthorized');
    return this.bookingsService.findAll(Number(req.user.userId), req.user.role);
  }

  /**
   * Метод получения бронирования по ID
   * @param req Объект запроса с данными пользователя
   * @param id ID бронирования
   */
  @Get(':id')
  findOne(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (!req.user) throw new Error('Unauthorized');
    return this.bookingsService.findOne(
      Number(req.user.userId),
      req.user.role,
      id,
    );
  }

  /**
   * Метод отмены бронирования
   * @param req Объект запроса с данными пользователя
   * @param id ID бронирования для отмены
   */
  @Delete(':id')
  cancel(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (!req.user) throw new Error('Unauthorized');
    return this.bookingsService.cancel(
      Number(req.user.userId),
      req.user.role,
      id,
    );
  }
}
