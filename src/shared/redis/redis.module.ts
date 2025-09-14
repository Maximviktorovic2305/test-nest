import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { CacheService } from './cache.service';
import { TokenBlacklistService } from './token-blacklist.service';

@Module({
  providers: [RedisService, CacheService, TokenBlacklistService],
  exports: [RedisService, CacheService, TokenBlacklistService],
})
export class RedisModule {}
