import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// DTO для регистрации пользователя — содержит email, пароль и имя
export class RegisterDto {
  // Email пользователя (должен быть валидным email адресом)
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
  })
  @IsEmail()
  email: string;

  // Пароль пользователя (обязательное поле, минимум 6 символов)
  @ApiProperty({
    example: 'password123',
    description: 'Пароль пользователя (минимум 6 символов)',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  // Имя пользователя (обязательное поле)
  @ApiProperty({
    example: 'Иван Иванов',
    description: 'Имя пользователя',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
