import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Добро пожаловать в API бронирования событий! Перейдите по адресу /api для документации.';
  }
}
