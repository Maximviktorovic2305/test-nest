import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../shared/database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../../types';
import * as bcrypt from 'bcrypt';

/**
 * Сервис аутентификации
 * Обрабатывает регистрацию, вход и валидацию пользователей
 */
@Injectable()
export class AuthService {
  constructor(
    // Сервис для работы с базой данных через Prisma
    private readonly prisma: PrismaService,
    // Сервис для работы с JWT токенами
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Метод регистрации нового пользователя
   * @param registerDto Данные для регистрации
   * @returns Объект с JWT токеном и данными пользователя
   */
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

  /**
   * Метод входа пользователя
   * @param loginDto Данные для входа
   * @returns Объект с JWT токеном и данными пользователя
   */
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

  /**
   * Метод валидации пользователя по ID
   * @param userId ID пользователя
   * @returns Объект пользователя без пароля или null
   */
  async validateUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      // Убираем пароль из возвращаемого объекта
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }
}
