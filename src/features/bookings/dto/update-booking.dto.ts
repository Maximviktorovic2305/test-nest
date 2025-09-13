import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto';

/**
 * DTO для обновления бронирования
 * Расширяет CreateBookingDto и добавляет поле статуса
 */
export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  // Статус бронирования
  status: string;
}
