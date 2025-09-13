import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// DTO для создания события — описывает входные данные для создания
export class CreateEventDto {
  // Название события (обязательное поле)
  @ApiProperty({
    example: 'Концерт группы XYZ',
    description: 'Название события',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  // Описание события (необязательное поле)
  @ApiProperty({
    example: 'Ежегодный концерт популярной группы XYZ',
    description: 'Описание события',
    required: false,
  })
  @IsString()
  @IsOptional()
  description: string;

  // Дата события в формате ISO
  @ApiProperty({
    example: '2025-12-31T20:00:00.000Z',
    description: 'Дата события в формате ISO 8601',
  })
  @IsDateString()
  date: string;

  // Место проведения события (обязательное поле)
  @ApiProperty({
    example: 'Концертный зал им. Чайковского, Москва',
    description: 'Место проведения события',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  // Общее количество мест на событие (обязательное поле, минимум 1)
  @ApiProperty({
    example: 100,
    description: 'Общее количество мест на событие',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  totalSeats: number;
}
