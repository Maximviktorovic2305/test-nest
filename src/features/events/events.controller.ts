import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

/**
 * Контроллер событий
 * Обрабатывает HTTP запросы для работы с событиями
 */
@Controller('events')
// Применяем гварды аутентификации и авторизации ко всем маршрутам
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(
    // Сервис для работы с событиями
    private readonly eventsService: EventsService,
  ) {}

  /**
   * Метод создания нового события
   * Доступен только для пользователей с ролью 'admin'
   */
  @Post()
  @Roles('admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  /**
   * Метод получения всех событий
   * Доступен для всех аутентифицированных пользователей
   */
  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll() {
    return this.eventsService.findAll();
  }

  /**
   * Метод получения события по ID
   * Доступен для всех аутентифицированных пользователей
   * @param id ID события
   */
  @Get(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }

  /**
   * Метод обновления события
   * Доступен только для пользователей с ролью 'admin'
   * @param id ID события для обновления
   * @param updateEventDto Данные для обновления события
   */
  @Patch(':id')
  @Roles('admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, updateEventDto);
  }

  /**
   * Метод удаления события
   * Доступен только для пользователей с ролью 'admin'
   * @param id ID события для удаления
   */
  @Delete(':id')
  @Roles('admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.remove(id);
  }
}
