import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class TokenBlacklistService {
  constructor(private readonly redisService: RedisService) {}

  // Добавляет токен в черный список с указанным временем жизни
  async blacklistToken(token: string, ttlSeconds: number): Promise<void> {
    // Используем токен как ключ, а значение может быть любым (например, 'blacklisted')
    await this.redisService.set(
      `blacklisted_token:${token}`,
      'true',
      ttlSeconds,
    );
  }

  // Проверяет, находится ли токен в черном списке
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.redisService.get(`blacklisted_token:${token}`);
    return result === 'true';
  }
}
