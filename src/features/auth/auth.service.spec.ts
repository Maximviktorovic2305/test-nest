import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../shared/database/prisma.service';
import { JwtService } from '@nestjs/jwt';

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

  it('register should create user and return token', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 1,
      email: 'a@a',
      name: 'Alex',
      role: 'user',
    });

    const result = await service.register({
      email: 'a@a',
      password: 'pass',
      name: 'Alex',
    });

    expect(prisma.user.create).toHaveBeenCalled();
    expect(result).toHaveProperty('access_token');
    expect(result.user).toMatchObject({ email: 'a@a', name: 'Alex' });
  });

  it('login should throw when user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(
      service.login({ email: 'no@no', password: 'x' }),
    ).rejects.toThrow();
  });
});
