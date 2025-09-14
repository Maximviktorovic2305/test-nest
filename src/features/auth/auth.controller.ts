import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserSchema } from '../../shared/swagger/user.schema';
import type { Request } from 'express';

// Контроллер аутентификации — обрабатывает регистрацию и вход пользователей
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    // Сервис аутентификации
    private readonly authService: AuthService,
  ) {}

  // Регистрирует нового пользователя (публичный маршрут)
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован',
    schema: UserSchema,
  })
  @ApiResponse({
    status: 400,
    description: 'Неверные данные для регистрации',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // Вход пользователя (публичный маршрут)
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Вход пользователя' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Успешный вход в систему',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          description: 'JWT токен для аутентификации',
        },
      },
      required: ['access_token'],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Неверные учетные данные',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Выход пользователя (защищенный маршрут)
  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Выход пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Успешный выход из системы',
  })
  @ApiResponse({
    status: 401,
    description: 'Неавторизованный доступ',
  })
  async logout(@Req() req: Request) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      await this.authService.logout(token);
    }
    return { message: 'Успешный выход' };
  }
}
