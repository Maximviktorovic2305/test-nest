import { Module } from '@nestjs/common';
import { NotificationProcessor } from './notification.processor';
import { QueueService } from './queue.service';

@Module({
  providers: [QueueService, NotificationProcessor],
  exports: [QueueService, NotificationProcessor],
})
export class QueueModule {}
