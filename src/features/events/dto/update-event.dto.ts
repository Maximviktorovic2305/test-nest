import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';

/**
 * DTO для обновления события
 * Расширяет CreateEventDto, делая все поля необязательными
 */
export class UpdateEventDto extends PartialType(CreateEventDto) {}
