import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Базовый класс для бизнес-исключений
 * Расширяет HttpException и предоставляет удобный способ создания пользовательских исключений
 */
export class BusinessException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(message, status);
  }
}

/**
 * Исключение для недостаточного количества свободных мест
 * Выбрасывается при попытке забронировать больше мест, чем доступно
 */
export class InsufficientSeatsException extends BusinessException {
  constructor(message: string = 'Недостаточно свободных мест') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

/**
 * Исключение для не найденного бронирования
 * Выбрасывается при попытке получить или изменить несуществующее бронирование
 */
export class BookingNotFoundException extends BusinessException {
  constructor(message: string = 'Бронирование не найдено') {
    super(message, HttpStatus.NOT_FOUND);
  }
}

/**
 * Исключение для не найденного события
 * Выбрасывается при попытке получить или забронировать несуществующее событие
 */
export class EventNotFoundException extends BusinessException {
  constructor(message: string = 'Событие не найдено') {
    super(message, HttpStatus.NOT_FOUND);
  }
}

/**
 * Исключение для неавторизованного доступа к бронированию
 * Выбрасывается при попытке получить или изменить чужое бронирование
 */
export class UnauthorizedBookingException extends BusinessException {
  constructor(
    message: string = 'У вас нет прав для доступа к этому бронированию',
  ) {
    super(message, HttpStatus.FORBIDDEN);
  }
}
