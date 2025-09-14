import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { environment } from '../config/environment';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  async onModuleInit() {
    this.client = createClient({
      url: `redis://${environment.redisHost}:${environment.redisPort}`,
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error', err);
    });

    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): RedisClientType {
    return this.client;
  }

  async set(
    key: string,
    value: string,
    expireInSeconds?: number,
  ): Promise<void> {
    if (expireInSeconds) {
      await this.client.setEx(key, expireInSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    return await this.client.exists(key);
  }

  // Enhanced caching methods
  async setObject(
    key: string,
    value: any,
    expireInSeconds?: number,
  ): Promise<void> {
    const serializedValue = JSON.stringify(value);
    await this.set(key, serializedValue, expireInSeconds);
  }

  async getObject<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (value === null) {
      return null;
    }
    return JSON.parse(value) as T;
  }

  async setWithExpiration(
    key: string,
    value: string,
    expireInSeconds: number,
  ): Promise<void> {
    await this.client.setEx(key, expireInSeconds, value);
  }

  async increment(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  async decrement(key: string): Promise<number> {
    return await this.client.decr(key);
  }

  async flushAll(): Promise<void> {
    await this.client.flushAll();
  }
}
