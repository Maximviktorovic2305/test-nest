import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';

/**
 * Контроллер аутентификации
 * Обрабатывает запросы на регистрацию и вход пользователей
 */
@Controller('auth')
export class AuthController {
  constructor(
    // Сервис аутентификации
    private readonly authService: AuthService,
  ) {}

  /**
   * Метод регистрации нового пользователя
   * Доступен без аутентификации благодаря @Public()
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Метод входа пользователя
   * Доступен без аутентификации благодаря @Public()
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
