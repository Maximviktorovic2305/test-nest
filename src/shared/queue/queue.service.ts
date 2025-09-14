import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Queue, Worker, QueueEvents, Job, JobsOptions } from 'bullmq';
import { environment } from '../config/environment';

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  private queueEvents: Map<string, QueueEvents> = new Map();

  async onModuleInit() {
    // Инициализация подключения к Redis для очередей происходит автоматически
    // при создании экземпляров Queue, Worker и QueueEvents
  }

  async onModuleDestroy() {
    // Закрываем все очереди, воркеры и события при завершении работы приложения
    for (const [, queue] of this.queues) {
      await queue.close();
    }

    for (const [, worker] of this.workers) {
      await worker.close();
    }

    for (const [, queueEvents] of this.queueEvents) {
      await queueEvents.close();
    }
  }

  // Создает новую очередь с указанным именем
  createQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, {
        connection: {
          host: environment.redisHost,
          port: environment.redisPort,
        },
      });
      this.queues.set(name, queue);
    }
    return this.queues.get(name)!;
  }

  // Создает воркер для обработки заданий из очереди
  createWorker(
    queueName: string,
    processor: (job: Job) => Promise<any>,
  ): Worker {
    if (!this.workers.has(queueName)) {
      const worker = new Worker(queueName, processor, {
        connection: {
          host: environment.redisHost,
          port: environment.redisPort,
        },
      });
      this.workers.set(queueName, worker);
    }
    return this.workers.get(queueName)!;
  }

  // Создает обработчик событий очереди
  createQueueEvents(queueName: string): QueueEvents {
    if (!this.queueEvents.has(queueName)) {
      const queueEvents = new QueueEvents(queueName, {
        connection: {
          host: environment.redisHost,
          port: environment.redisPort,
        },
      });
      this.queueEvents.set(queueName, queueEvents);
    }
    return this.queueEvents.get(queueName)!;
  }

  // Добавляет задание в очередь
  async addJob(
    queueName: string,
    jobName: string,
    data: any,
    options?: JobsOptions,
  ): Promise<Job> {
    const queue = this.createQueue(queueName);
    return await queue.add(jobName, data, options);
  }

  // Получает очередь по имени
  getQueue(name: string): Queue | undefined {
    return this.queues.get(name);
  }

  // Получает воркер по имени очереди
  getWorker(queueName: string): Worker | undefined {
    return this.workers.get(queueName);
  }
}
