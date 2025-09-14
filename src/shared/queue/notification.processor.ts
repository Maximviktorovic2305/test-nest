import { Injectable, OnModuleInit } from '@nestjs/common';
import { QueueService } from './queue.service';
import { Job } from 'bullmq';

// Интерфейс для данных уведомления
interface NotificationData {
  userId: number;
  message: string;
  type: 'email' | 'sms' | 'push';
  recipient: string;
}

@Injectable()
export class NotificationProcessor implements OnModuleInit {
  private readonly QUEUE_NAME = 'notifications';

  constructor(private readonly queueService: QueueService) {}

  async onModuleInit() {
    // Создаем воркер для обработки уведомлений
    this.queueService.createWorker(
      this.QUEUE_NAME,
      async (job: Job<NotificationData>) => {
        console.log(
          `Обработка уведомления для пользователя ${job.data.userId}`,
        );
        console.log(`Тип: ${job.data.type}, Сообщение: ${job.data.message}`);

        // Здесь должна быть логика отправки уведомлений
        // Это может быть отправка email, SMS или push-уведомлений
        switch (job.data.type) {
          case 'email':
            await this.sendEmail(job.data);
            break;
          case 'sms':
            await this.sendSms(job.data);
            break;
          case 'push':
            await this.sendPushNotification(job.data);
            break;
        }

        console.log(
          `Уведомление для пользователя ${job.data.userId} успешно отправлено`,
        );
      },
    );

    // Создаем обработчик событий очереди для логирования
    const queueEvents = this.queueService.createQueueEvents(this.QUEUE_NAME);

    queueEvents.on('completed', ({ jobId }) => {
      console.log(`Задание ${jobId} успешно выполнено`);
    });

    queueEvents.on('failed', ({ jobId, failedReason }) => {
      console.error(`Задание ${jobId} завершено с ошибкой: ${failedReason}`);
    });

    // Добавляем await для удовлетворения линтера
    await Promise.resolve();
  }

  // Добавляет уведомление в очередь
  async queueNotification(data: NotificationData) {
    await this.queueService.addJob(this.QUEUE_NAME, 'send-notification', data, {
      attempts: 3, // Попытки повторной отправки при ошибке
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }

  // Отправляет email уведомление
  private async sendEmail(data: NotificationData): Promise<void> {
    // Имитация отправки email
    console.log(`Отправка email на ${data.recipient}: ${data.message}`);
    // В реальной реализации здесь будет код для отправки email
    await new Promise((resolve) => setTimeout(resolve, 100)); // Имитация задержки
  }

  // Отправляет SMS уведомление
  private async sendSms(data: NotificationData): Promise<void> {
    // Имитация отправки SMS
    console.log(`Отправка SMS на ${data.recipient}: ${data.message}`);
    // В реальной реализации здесь будет код для отправки SMS
    await new Promise((resolve) => setTimeout(resolve, 50)); // Имитация задержки
  }

  // Отправляет push-уведомление
  private async sendPushNotification(data: NotificationData): Promise<void> {
    // Имитация отправки push-уведомления
    console.log(
      `Отправка push-уведомления на ${data.recipient}: ${data.message}`,
    );
    // В реальной реализации здесь будет код для отправки push-уведомлений
    await new Promise((resolve) => setTimeout(resolve, 30)); // Имитация задержки
  }
}
