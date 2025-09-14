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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EventSchema } from '../../shared/swagger/event.schema';

@ApiTags('events')
@ApiBearerAuth()
@Controller('events')
// Применяем гварды аутентификации и авторизации ко всем маршрутам
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(
    // Сервис для работы с событиями
    private readonly eventsService: EventsService,
  ) {}

  // Создает новое событие (требуется роль 'admin')
  @Post()
  @Roles('admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: 'Создать новое событие (только для администраторов)',
  })
  @ApiBody({ type: CreateEventDto })
  @ApiResponse({
    status: 201,
    description: 'Событие успешно создано',
    schema: EventSchema,
  })
  @ApiResponse({
    status: 400,
    description: 'Неверные данные для создания события',
  })
  @ApiResponse({
    status: 401,
    description: 'Неавторизованный доступ',
  })
  @ApiResponse({
    status: 403,
    description: 'Доступ запрещен (требуется роль администратора)',
  })
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  // Получает все события (доступно всем аутентифицированным)
  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Получить все события' })
  @ApiResponse({
    status: 200,
    description: 'Список всех событий',
    schema: {
      type: 'array',
      items: EventSchema,
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Неавторизованный доступ',
  })
  findAll() {
    return this.eventsService.findAll();
  }

  // Получает событие по ID (доступно всем аутентифицированным)
  @Get(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Получить событие по ID' })
  @ApiParam({ name: 'id', description: 'ID события', type: 'integer' })
  @ApiResponse({
    status: 200,
    description: 'Информация о событии',
    schema: EventSchema,
  })
  @ApiResponse({
    status: 401,
    description: 'Неавторизованный доступ',
  })
  @ApiResponse({
    status: 404,
    description: 'Событие не найдено',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }

  // Обновляет событие по ID (требуется роль 'admin')
  @Patch(':id')
  @Roles('admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: 'Обновить событие по ID (только для администраторов)',
  })
  @ApiParam({ name: 'id', description: 'ID события', type: 'integer' })
  @ApiBody({ type: UpdateEventDto })
  @ApiResponse({
    status: 200,
    description: 'Событие успешно обновлено',
    schema: EventSchema,
  })
  @ApiResponse({
    status: 400,
    description: 'Неверные данные для обновления события',
  })
  @ApiResponse({
    status: 401,
    description: 'Неавторизованный доступ',
  })
  @ApiResponse({
    status: 403,
    description: 'Доступ запрещен (требуется роль администратора)',
  })
  @ApiResponse({
    status: 404,
    description: 'Событие не найдено',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, updateEventDto);
  }

  // Удаляет событие по ID (требуется роль 'admin')
  @Delete(':id')
  @Roles('admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: 'Удалить событие по ID (только для администраторов)',
  })
  @ApiParam({ name: 'id', description: 'ID события', type: 'integer' })
  @ApiResponse({
    status: 200,
    description: 'Событие успешно удалено',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Событие с ID 1 успешно удалено',
          description: 'Сообщение об успешном удалении события',
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
    description: 'Доступ запрещен (требуется роль администратора)',
  })
  @ApiResponse({
    status: 404,
    description: 'Событие не найдено',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.remove(id);
  }
}
