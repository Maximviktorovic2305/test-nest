import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { TokenBlacklistService } from './token-blacklist.service';
import { RedisService } from './redis.service';

@Module({
  providers: [RedisService, CacheService, TokenBlacklistService],
  exports: [RedisService, CacheService, TokenBlacklistService],
})
export class RedisModule {}
