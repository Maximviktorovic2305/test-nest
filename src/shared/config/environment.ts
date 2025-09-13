import { config } from 'dotenv';
import * as process from 'process';
import { Environment } from '../../types';

// Загружаем переменные окружения из .env файла
config();

/**
 * Parses a string value to integer with fallback
 * @param value The string value to parse
 * @param fallback The fallback value if parsing fails
 * @returns The parsed integer or fallback value
 */
const parseIntWithFallback = (
  value: string | undefined,
  fallback: number,
): number => {
  if (value === undefined) {
    return fallback;
  }

  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
};

/**
 * Конфигурация окружения приложения
 * Содержит все необходимые настройки для работы приложения
 */
export const environment: Environment = {
  // URL подключения к базе данных
  databaseUrl:
    process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/bron_db',
  // Секретный ключ для JWT токенов
  jwtSecret: process.env.JWT_SECRET || 'secret-key',
  // Время жизни JWT токена
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '3600s',
  // Хост Redis сервера
  redisHost: process.env.REDIS_HOST || 'localhost',
  // Порт Redis сервера
  redisPort: parseIntWithFallback(process.env.REDIS_PORT, 6379),
  // Порт приложения
  port: parseIntWithFallback(process.env.PORT, 3000),
};
