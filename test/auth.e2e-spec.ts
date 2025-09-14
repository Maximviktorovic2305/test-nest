import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthModule } from './../src/features/auth/auth.module';
import { PrismaService } from '../src/shared/database/prisma.service';
import * as bcrypt from 'bcrypt';

// Запускаются с sqlite in-memory для проверки аутентификации через Prisma
describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const users: any[] = [];
  let userIdSeq = 1;

  beforeAll(async () => {
    // Создаем in-memory mock сервиса Prisma для детерминированного выполнения тестов без внешней БД
    const moduleBuilder = Test.createTestingModule({
      imports: [AuthModule],
    });

    // In-memory хранилище с локальными типами чтобы избежать использования `any`
    interface MockUser {
      id: number;
      email: string;
      password: string;
      name: string;
      role: string;
    }

    const createMockPrisma = () => {
      const mock = {
        $connect: async () => {},
        $disconnect: async () => {},
        user: {
          findUnique: (params: { where: { email?: string; id?: number } }) => {
            const { where } = params;
            if (where.email) {
              return users.find((u) => u.email === where.email) || null;
            }
            if (where.id) {
              return users.find((u) => u.id === where.id) || null;
            }
            return null;
          },
          create: ({ data }: { data: Omit<MockUser, 'id'> }) => {
            const user: MockUser = {
              id: userIdSeq++,
              ...data,
              role: data.role || 'user',
            } as MockUser;
            users.push(user);
            return user;
          },
        },
      };

      return mock;
    };

    const prismaMock = createMockPrisma();

    const moduleFixture = await moduleBuilder
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  afterEach(() => {
    // Очищаем массив пользователей между тестами
    while (users.length > 0) {
      users.pop();
    }
    userIdSeq = 1;
  });

  describe('POST /auth/register', () => {
    it('должен зарегистрировать нового пользователя и вернуть токен доступа', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Тестовый Пользователь',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(registerDto.email);
      expect(response.body.user.name).toBe(registerDto.name);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('должен вернуть ошибку при попытке регистрации уже существующего пользователя', async () => {
      // Сначала создаем пользователя
      const existingUser = {
        email: 'existing@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Существующий Пользователь',
      };
      await prisma.user.create({ data: existingUser });

      // Пытаемся зарегистрироваться с тем же email
      const registerDto = {
        email: 'existing@example.com',
        password: 'password456',
        name: 'Новый Пользователь',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(401);
    });

    it('должен вернуть ошибку при попытке регистрации с невалидными данными', async () => {
      const registerDto = {
        email: 'invalid-email',
        password: '123', // Слишком короткий
        name: '', // Пустое имя
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('должен выполнить вход существующего пользователя и вернуть токен доступа', async () => {
      // Сначала создаем пользователя
      const plainPassword = 'password123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const user = {
        email: 'login@example.com',
        password: hashedPassword,
        name: 'Пользователь для входа',
      };
      await prisma.user.create({ data: user });

      const loginDto = {
        email: 'login@example.com',
        password: plainPassword,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(loginDto.email);
      expect(response.body.user.name).toBe(user.name);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('должен вернуть ошибку при попытке входа несуществующего пользователя', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });

    it('должен вернуть ошибку при попытке входа с неверным паролем', async () => {
      // Сначала создаем пользователя
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      const user = {
        email: 'wrongpass@example.com',
        password: hashedPassword,
        name: 'Пользователь с неверным паролем',
      };
      await prisma.user.create({ data: user });

      const loginDto = {
        email: 'wrongpass@example.com',
        password: 'wrongpassword',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });

    it('должен вернуть ошибку при попытке входа с невалидными данными', async () => {
      const loginDto = {
        email: 'invalid-email',
        password: '', // Пустой пароль
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(400);
    });
  });
});
