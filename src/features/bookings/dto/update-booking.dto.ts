import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto';

// DTO для обновления бронирования — делает поля CreateBookingDto необязательными и добавляет статус
export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  // Статус бронирования
  status: string;
}
