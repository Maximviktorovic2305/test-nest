import { config } from 'dotenv';
import * as process from 'process';
import { Environment } from '../../types';

// Загружаем переменные окружения из .env файла
config();

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
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  // Порт приложения
  port: parseInt(process.env.PORT || '3000', 10),
};
