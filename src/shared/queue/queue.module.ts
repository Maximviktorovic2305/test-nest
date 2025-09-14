import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { NotificationProcessor } from './notification.processor';

@Module({
  providers: [QueueService, NotificationProcessor],
  exports: [QueueService, NotificationProcessor],
})
export class QueueModule {}
