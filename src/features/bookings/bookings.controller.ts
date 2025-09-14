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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BookingSchema } from '../../shared/swagger/booking.schema';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
// Применяем гвард аутентификации ко всем маршрутам
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // Создает новое бронирование для авторизованного пользователя
  @Post()
  @Throttle({ default: { limit: 5, ttl: 60 } }) // 5 запросов на 60 сек
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Создать новое бронирование' })
  @ApiBody({ type: CreateBookingDto })
  @ApiResponse({
    status: 201,
    description: 'Бронирование успешно создано',
    schema: BookingSchema,
  })
  @ApiResponse({
    status: 400,
    description: 'Неверные данные для создания бронирования',
  })
  @ApiResponse({
    status: 401,
    description: 'Неавторизованный доступ',
  })
  @ApiResponse({
    status: 404,
    description: 'Событие не найдено',
  })
  @ApiResponse({
    status: 409,
    description: 'Недостаточно свободных мест',
  })
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    if (!req.user) throw new Error('Unauthorized');
    return this.bookingsService.create(
      Number(req.user.userId),
      createBookingDto,
    );
  }

  // Получает все бронирования пользователя (или все для admin)
  @Get()
  @ApiOperation({
    summary:
      'Получить все бронирования пользователя (или все для администратора)',
  })
  @ApiResponse({
    status: 200,
    description: 'Список бронирований',
    schema: {
      type: 'array',
      items: BookingSchema,
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Неавторизованный доступ',
  })
  findAll(@Request() req: AuthenticatedRequest) {
    if (!req.user) throw new Error('Unauthorized');
    return this.bookingsService.findAll(Number(req.user.userId), req.user.role);
  }

  // Метод получения бронирования по ID
  @Get(':id')
  @ApiOperation({ summary: 'Получить бронирование по ID' })
  @ApiParam({ name: 'id', description: 'ID бронирования', type: 'integer' })
  @ApiResponse({
    status: 200,
    description: 'Информация о бронировании',
    schema: BookingSchema,
  })
  @ApiResponse({
    status: 401,
    description: 'Неавторизованный доступ',
  })
  @ApiResponse({
    status: 403,
    description: 'Доступ запрещен (попытка доступа к чужому бронированию)',
  })
  @ApiResponse({
    status: 404,
    description: 'Бронирование не найдено',
  })
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

  // Отменяет бронирование по ID для авторизованного пользователя
  @Delete(':id')
  @ApiOperation({ summary: 'Отменить бронирование по ID' })
  @ApiParam({ name: 'id', description: 'ID бронирования', type: 'integer' })
  @ApiResponse({
    status: 200,
    description: 'Бронирование успешно отменено',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Бронирование с ID 1 успешно отменено',
          description: 'Сообщение об успешной отмене бронирования',
        },
      },
      required: ['message'],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Неавторизованный доступ',
  })
  @ApiResponse({
    status: 403,
    description: 'Доступ запрещен (попытка отмены чужого бронирования)',
  })
  @ApiResponse({
    status: 404,
    description: 'Бронирование не найдено',
  })
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
