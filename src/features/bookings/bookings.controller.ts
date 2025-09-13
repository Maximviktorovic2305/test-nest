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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
  @UsePipes(new ValidationPipe({ transform: true }))
  create(
    @Request() req: { user: { userId: string; role: string } },
    @Body() createBookingDto: CreateBookingDto,
  ) {
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
  findAll(@Request() req: { user: { userId: string; role: string } }) {
    return this.bookingsService.findAll(Number(req.user.userId), req.user.role);
  }

  /**
   * Метод получения бронирования по ID
   * @param req Объект запроса с данными пользователя
   * @param id ID бронирования
   */
  @Get(':id')
  findOne(
    @Request() req: { user: { userId: string; role: string } },
    @Param('id', ParseIntPipe) id: number,
  ) {
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
    @Request() req: { user: { userId: string; role: string } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bookingsService.cancel(
      Number(req.user.userId),
      req.user.role,
      id,
    );
  }
}
