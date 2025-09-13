import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to the Event Booking API! Visit /api for documentation.';
  }
}
