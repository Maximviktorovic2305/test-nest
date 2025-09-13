import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * DTO для регистрации пользователя
 * Содержит данные, необходимые для регистрации нового пользователя
 */
export class RegisterDto {
  // Email пользователя (должен быть валидным email адресом)
  @IsEmail()
  email: string;

  // Пароль пользователя (обязательное поле, минимум 6 символов)
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  // Имя пользователя (обязательное поле)
  @IsString()
  @IsNotEmpty()
  name: string;
}
