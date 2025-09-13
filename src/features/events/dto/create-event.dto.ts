import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsOptional,
  IsDateString,
} from 'class-validator';

/**
 * DTO для создания события
 * Содержит все необходимые поля для создания нового события
 */
export class CreateEventDto {
  // Название события (обязательное поле)
  @IsString()
  @IsNotEmpty()
  title: string;

  // Описание события (необязательное поле)
  @IsString()
  @IsOptional()
  description: string;

  // Дата события в формате ISO
  @IsDateString()
  date: string;

  // Место проведения события (обязательное поле)
  @IsString()
  @IsNotEmpty()
  location: string;

  // Общее количество мест на событие (обязательное поле, минимум 1)
  @IsInt()
  @Min(1)
  totalSeats: number;
}
