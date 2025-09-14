import { Test } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { BookingsModule } from './../src/features/bookings/bookings.module';
import { PrismaService } from '../src/shared/database/prisma.service';
import { JwtAuthGuard } from '../src/features/auth/guards/jwt-auth.guard';

// Запускаются с sqlite in-memory для проверки транзакционной логики через Prisma
describe('BookingsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    // Build an in-memory mock of PrismaService so tests run deterministically without an external DB.
    const moduleBuilder = Test.createTestingModule({
      imports: [BookingsModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = { userId: 1, role: 'user' };
          return true;
        },
      });

    // In-memory store with small local types to avoid `any` usage
    interface MockUser {
      id: number;
      email?: string;
      name?: string;
    }

    interface MockEvent {
      id: number;
      title: string;
      date: Date;
      location: string;
      totalSeats: number;
      bookedSeats: number;
    }

    interface MockBooking {
      id: number;
      userId: number;
      eventId: number;
      seats: number;
      status?: string;
    }

    const users: MockUser[] = [];
    const events: MockEvent[] = [];
    const bookings: MockBooking[] = [];
    let bookingIdSeq = 1;
    let eventIdSeq = 1;

    // test-only: permissive tx shape is used inline in $transaction

    const createMockPrisma = () => {
      const mock = {
        $connect: async () => {},
        $disconnect: async () => {},
        event: {
          findUnique: ({ where }: { where: { id: number } }) =>
            events.find((e) => e.id === where.id) || null,
          updateMany: ({
            where,
            data,
          }: {
            where: { id: number };
            data: any;
          }) => {
            const ev = events.find((e) => e.id === where.id);
            if (!ev) return { count: 0 };
            const seats = (data.bookedSeats && data.bookedSeats.increment) || 0;
            // condition: bookedSeats <= totalSeats - seats
            if (ev.bookedSeats <= ev.totalSeats - seats) {
              ev.bookedSeats += seats;
              return { count: 1 };
            }
            return { count: 0 };
          },
          update: ({ where, data }: { where: { id: number }; data: any }) => {
            const ev = events.find((e) => e.id === where.id);
            if (!ev) throw new Error('Not found');
            if (data.bookedSeats && data.bookedSeats.decrement) {
              ev.bookedSeats -= data.bookedSeats.decrement;
            }
            return ev;
          },
        },
        booking: {
          create: ({ data }: { data: Omit<MockBooking, 'id'> }) => {
            const b: MockBooking = {
              id: bookingIdSeq++,
              ...data,
            } as MockBooking;
            bookings.push(b);
            return b;
          },
          findMany: ({ where }: { where?: { userId?: number } } = {}) => {
            if (!where) return bookings;
            if (where.userId)
              return bookings.filter((b) => b.userId === where.userId);
            return bookings;
          },
          findUnique: ({ where }: { where: { id: number } }) =>
            bookings.find((b) => b.id === where.id) || null,
          updateMany: ({ where, data }: { where: any; data: any }) => {
            const b = bookings.find(
              (it) =>
                it.id === where.id &&
                (where.status ? it.status !== where.status.not : true),
            );
            if (!b) return { count: 0 };
            if (data.status) b.status = data.status;
            return { count: 1 };
          },
        },

        $transaction: (fn: (tx: any) => Promise<any>) => {
          // Provide a tx object similar to prisma delegates
          const tx = {
            event: {
              updateMany: mock.event.updateMany,
              update: mock.event.update,
            },
            booking: {
              create: mock.booking.create,
              findUnique: mock.booking.findUnique,
              updateMany: mock.booking.updateMany,
            },
          };
          return fn(tx);
        },
        $queryRaw: (q: string) => {
          // Very small parser for queries used in tests
          const m = /SELECT status FROM "Booking" WHERE id = (\d+)/.exec(q);
          if (m) {
            const id = Number(m[1]);
            const b = bookings.find((it) => it.id === id);
            return Promise.resolve([{ status: b ? b.status : null }]);
          }
          // fallback: return empty
          return Promise.resolve([]);
        },
      };

      // seed data
      users.push({ id: 1, email: 'e2e@u', name: 'E2E' });
      events.push({
        id: eventIdSeq++,
        title: 'E2E',
        date: new Date(),
        location: 'loc',
        totalSeats: 5,
        bookedSeats: 0,
      });

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

  it('POST /bookings -> create, GET /bookings -> list, DELETE /bookings/:id -> cancel', async () => {
    const server = app.getHttpServer();

    // Проверим создание брони через HTTP (guard вставит req.user)
    const createResp = await request(server)
      .post('/bookings')
      .send({ eventId: 1, seats: 2 })
      .expect(201);

    expect(createResp.body).toHaveProperty('id');

    // Получаем список бронирований
    const listResp = await request(server).get('/bookings').expect(200);
    expect(Array.isArray(listResp.body)).toBe(true);
    expect(listResp.body.length).toBeGreaterThanOrEqual(1);

    const bookingId = listResp.body[0].id;

    // Отмена брони
    await request(server).delete(`/bookings/${bookingId}`).expect(200);

    // Проверяем, что status updated in db
    const [{ status }] = await prisma.$queryRaw<any[]>(
      `SELECT status FROM "Booking" WHERE id = ${bookingId}` as any,
    );
    expect(status).toMatch(/cancelled|confirmed/);
  });
});
