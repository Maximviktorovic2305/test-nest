import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// DTO для создания бронирования — содержит eventId и seats
export class CreateBookingDto {
  // ID события для бронирования (обязательное поле, минимум 1)
  @ApiProperty({
    example: 1,
    description: 'ID события для бронирования',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  eventId: number;

  // Количество бронируемых мест (обязательное поле, минимум 1)
  @ApiProperty({
    example: 2,
    description: 'Количество бронируемых мест',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  seats: number;
}
