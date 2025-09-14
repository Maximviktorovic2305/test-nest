import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../shared/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

// Мокаем bcrypt перед импортом AuthService
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;
  type PrismaUserMock = {
    findUnique: jest.Mock;
    create: jest.Mock;
  };

  type PrismaMock = {
    user: PrismaUserMock;
  };

  let prisma: PrismaMock;
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('должен зарегистрировать нового пользователя и вернуть токен', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 1,
        email: 'a@a',
        name: 'Alex',
        role: 'user',
        password: 'hashedPassword',
      });

      const result = await service.register({
        email: 'a@a',
        password: 'pass',
        name: 'Alex',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'a@a' },
      });
      expect(prisma.user.create).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('pass', 10);
      expect(result).toHaveProperty('access_token');
      expect(result.user).toMatchObject({ email: 'a@a', name: 'Alex' });
    });

    it('должен вернуть ошибку если пользователь уже существует', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'a@a',
        name: 'Alex',
        role: 'user',
        password: 'hashedPassword',
      });

      await expect(
        service.register({
          email: 'a@a',
          password: 'pass',
          name: 'Alex',
        }),
      ).rejects.toThrow('Пользователь уже существует');
    });
  });

  describe('login', () => {
    it('должен вернуть ошибку когда пользователь не найден', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'no@no', password: 'x' }),
      ).rejects.toThrow('Неверные учетные данные');
    });

    it('должен вернуть ошибку когда пароль неверный', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        name: 'Test',
        role: 'user',
        password: 'hashedPassword',
      };

      prisma.user.findUnique.mockResolvedValue(user);

      // Мокаем bcrypt.compare чтобы вернуть false для неверного пароля
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow('Неверные учетные данные');
    });

    it('должен вернуть токен доступа и данные пользователя при успешном входе', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        name: 'Test',
        role: 'user',
        password: 'hashedPassword',
      };

      prisma.user.findUnique.mockResolvedValue(user);

      // Мокаем bcrypt.compare чтобы вернуть true для верного пароля
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'correct',
      });

      expect(bcrypt.compare).toHaveBeenCalledWith('correct', 'hashedPassword');
      expect(result).toHaveProperty('access_token');
      expect(result.user).toMatchObject({
        id: 1,
        email: 'test@example.com',
        name: 'Test',
        role: 'user',
      });
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('validateUser', () => {
    it('должен вернуть данные пользователя без пароля когда пользователь существует', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        name: 'Test',
        role: 'user',
        password: 'hashedPassword',
      };

      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.validateUser(1);

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        name: 'Test',
        role: 'user',
      });
    });

    it('должен вернуть null когда пользователь не существует', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser(999);

      expect(result).toBeNull();
    });
  });
});
