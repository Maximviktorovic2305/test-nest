import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class CacheService {
  constructor(private readonly redisService: RedisService) {}

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    await this.redisService.setObject(key, value, ttlSeconds);
  }

  async get<T>(key: string): Promise<T | null> {
    return await this.redisService.getObject<T>(key);
  }

  async delete(key: string): Promise<void> {
    await this.redisService.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redisService.exists(key);
    return result > 0;
  }

  async flush(): Promise<void> {
    await this.redisService.flushAll();
  }
}
