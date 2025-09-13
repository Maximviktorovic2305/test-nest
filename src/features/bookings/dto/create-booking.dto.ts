import { IsInt, Min } from 'class-validator';

/**
 * DTO для создания бронирования
 * Содержит данные, необходимые для создания нового бронирования
 */
export class CreateBookingDto {
  // ID события для бронирования (обязательное поле, минимум 1)
  @IsInt()
  @Min(1)
  eventId: number;

  // Количество бронируемых мест (обязательное поле, минимум 1)
  @IsInt()
  @Min(1)
  seats: number;
}
