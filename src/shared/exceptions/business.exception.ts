import { HttpException, HttpStatus } from '@nestjs/common';

// Базовый класс для бизнес-исключений (расширяет HttpException)
export class BusinessException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(message, status);
  }
}

// Исключение: недостаточно свободных мест
export class InsufficientSeatsException extends BusinessException {
  constructor(message: string = 'Недостаточно свободных мест') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

// Исключение: бронирование не найдено
export class BookingNotFoundException extends BusinessException {
  constructor(message: string = 'Бронирование не найдено') {
    super(message, HttpStatus.NOT_FOUND);
  }
}

// Исключение: событие не найдено
export class EventNotFoundException extends BusinessException {
  constructor(message: string = 'Событие не найдено') {
    super(message, HttpStatus.NOT_FOUND);
  }
}

// Исключение: попытка доступа к чужому бронированию (неавторизованный доступ)
export class UnauthorizedBookingException extends BusinessException {
  constructor(
    message: string = 'У вас нет прав для доступа к этому бронированию',
  ) {
    super(message, HttpStatus.FORBIDDEN);
  }
}
