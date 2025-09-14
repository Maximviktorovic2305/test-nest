import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../shared/database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload, PublicUser } from '../../types';
import * as bcrypt from 'bcrypt';
import { TokenBlacklistService } from '../../shared/redis/token-blacklist.service';

// Сервис аутентификации — регистрация, вход и валидация пользователей
@Injectable()
export class AuthService {
  constructor(
    // Сервис для работы с базой данных через Prisma
    private readonly prisma: PrismaService,
    // Сервис для работы с JWT токенами
    private readonly jwtService: JwtService,
    // Сервис для работы с черным списком токенов
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {}

  // Регистрирует нового пользователя и возвращает access token + данные
  async register(registerDto: RegisterDto) {
    // Проверяем, существует ли пользователь с таким email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Пользователь уже существует');
    }

    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Создаем нового пользователя
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
      },
    });

    // Генерируем JWT токен
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  // Выполняет вход пользователя и возвращает access token + данные
  async login(loginDto: LoginDto) {
    // Ищем пользователя по email
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    // Проверяем правильность пароля
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    // Генерируем JWT токен
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  // Выполняет выход пользователя и добавляет токен в черный список
  async logout(token: string): Promise<void> {
    // Получаем время жизни токена из конфигурации
    const ttlSeconds = 3600; // 1 hour default
    await this.tokenBlacklistService.blacklistToken(token, ttlSeconds);
  }

  // Валидирует пользователя по ID (используется стратегией JWT)
  async validateUser(userId: number): Promise<PublicUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      // Убираем пароль из возвращаемого объекта
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;

      return result;
    }
    return null;
  }

  // Проверяет, находится ли токен в черном списке
  async isTokenBlacklisted(token: string): Promise<boolean> {
    return await this.tokenBlacklistService.isTokenBlacklisted(token);
  }
}
