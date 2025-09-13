import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// DTO для входа пользователя — содержит email и пароль
export class LoginDto {
  // Email пользователя (должен быть валидным email адресом)
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
  })
  @IsEmail()
  email: string;

  // Пароль пользователя (обязательное поле)
  @ApiProperty({
    example: 'password123',
    description: 'Пароль пользователя',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
