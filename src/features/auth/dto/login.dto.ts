import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO для входа пользователя
 * Содержит данные, необходимые для аутентификации пользователя
 */
export class LoginDto {
  // Email пользователя (должен быть валидным email адресом)
  @IsEmail()
  email: string;

  // Пароль пользователя (обязательное поле)
  @IsString()
  @IsNotEmpty()
  password: string;
}
