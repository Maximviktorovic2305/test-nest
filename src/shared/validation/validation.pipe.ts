import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

/**
 * Пайп валидации данных
 * Использует class-validator и class-transformer для проверки входных данных
 */
@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  /**
   * Метод трансформации и валидации данных
   * @param value Входное значение для валидации
   * @param metadata Метаданные аргумента
   * @returns Проверенное значение или выбрасывает исключение
   */
  async transform(value: unknown, { metatype }: ArgumentMetadata) {
    // Если нет метатипа или тип не требует валидации, возвращаем значение как есть
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Преобразуем простой объект в экземпляр класса
    const object = plainToInstance(metatype, value as object) as unknown;
    // Выполняем валидацию
    const errors = await validate(object as object);

    // Если есть ошибки валидации, выбрасываем исключение
    if (errors.length > 0) {
      throw new BadRequestException('Валидация не пройдена');
    }

    return value;
  }

  /**
   * Метод проверки необходимости валидации типа
   * @param metatype Тип для проверки
   * @returns true если тип требует валидации, false если нет
   */
  private toValidate(metatype: new (...args: any[]) => any): boolean {
    // Базовые типы, которые не требуют валидации
    const types: Array<new (...args: any[]) => any> = [
      String,
      Boolean,
      Number,
      Array,
      Object,
    ];
    return !types.includes(metatype);
  }
}
