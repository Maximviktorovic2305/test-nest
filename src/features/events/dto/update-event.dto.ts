import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';

// DTO для обновления события — производная от CreateEventDto с необязательными полями
export class UpdateEventDto extends PartialType(CreateEventDto) {}
