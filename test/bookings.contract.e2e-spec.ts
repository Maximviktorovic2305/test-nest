import { PrismaClient as TestPrismaClient } from '../node_modules/.prisma/client_test';

describe('Bookings contract test (sqlite)', () => {
  let prisma: TestPrismaClient;

  beforeAll(async () => {
    // Ensure TEST_DATABASE_URL is set for sqlite file in workspace
    process.env.TEST_DATABASE_URL = 'file:./test.sqlite';
    // Generate test client should have been run before this test
    prisma = new TestPrismaClient();
    await prisma.$connect();
    // Clean up previous test db
    try {
      await prisma.$executeRaw`DROP TABLE IF EXISTS Booking`;
      await prisma.$executeRaw`DROP TABLE IF EXISTS Event`;
      await prisma.$executeRaw`DROP TABLE IF EXISTS User`;
    } catch {
      // ignore
    }

    // Create schema tables
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS User (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        name TEXT,
        password TEXT,
        role TEXT DEFAULT 'user',
        createdAt DATETIME,
        updatedAt DATETIME
      );
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS Event (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        date DATETIME,
        location TEXT,
        totalSeats INTEGER,
        bookedSeats INTEGER DEFAULT 0,
        createdAt DATETIME,
        updatedAt DATETIME
      );
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS Booking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        eventId INTEGER,
        seats INTEGER,
        status TEXT DEFAULT 'confirmed',
        createdAt DATETIME,
        updatedAt DATETIME
      );
    `;

    // Seed
    await prisma.user.create({
      data: { email: 'c@u', name: 'C', password: 'x' },
    });
    await prisma.event.create({
      data: { title: 'T', date: new Date(), location: 'L', totalSeats: 2 },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should perform atomic create via updateMany + create', async () => {
    const event = await prisma.event.findFirst();
    const user = await prisma.user.findFirst();

    // successful booking of 1 seat
    const result = await prisma.$transaction(async (tx) => {
      const update = await tx.event.updateMany({
        where: { id: event.id, bookedSeats: { lte: event.totalSeats - 1 } },
        data: { bookedSeats: { increment: 1 } },
      });
      if (update.count === 0) throw new Error('No seats');
      return tx.booking.create({
        data: { userId: user.id, eventId: event.id, seats: 1 },
      });
    });

    expect(result).toHaveProperty('id');

    // Now attempt to overbook: request 2 seats but only 1 left
    await expect(
      prisma.$transaction(async (tx) => {
        const update = await tx.event.updateMany({
          where: { id: event.id, bookedSeats: { lte: event.totalSeats - 2 } },
          data: { bookedSeats: { increment: 2 } },
        });
        if (update.count === 0) throw new Error('No seats');
        return tx.booking.create({
          data: { userId: user.id, eventId: event.id, seats: 2 },
        });
      }),
    ).rejects.toThrow();
  });

  it('concurrent stress test: multiple parallel attempts should not overbook', async () => {
    const event = await prisma.event.findFirst();
    const user = await prisma.user.findFirst();

    // Helper to attempt booking via transaction (simulate separate clients)
    const attemptBooking = async (seats: number) =>
      prisma.$transaction(async (tx) => {
        const update = await tx.event.updateMany({
          where: {
            id: event.id,
            bookedSeats: { lte: event.totalSeats - seats },
          },
          data: { bookedSeats: { increment: seats } },
        });
        if (update.count === 0) throw new Error('No seats');
        return tx.booking.create({
          data: { userId: user.id, eventId: event.id, seats },
        });
      });

    // Prepare parallel attempts: there are totalSeats (2), try three concurrent attempts of 1 seat
    const attempts = [1, 1, 1];

    const results = await Promise.allSettled(
      attempts.map((s) => attemptBooking(s)),
    );

    // Count successful bookings of the concurrent attempts
    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    const bookings = await prisma.booking.findMany({
      where: { eventId: event.id },
    });

    // There may be pre-existing bookings from previous tests; account for them
    const initialBookingsCount = 1; // from the earlier test that booked 1 seat
    const expectedBookingsAfter = initialBookingsCount + successCount;

    const bookedSeatsSum = bookings.reduce((acc, b) => acc + b.seats, 0);
    expect(bookedSeatsSum).toBeLessThanOrEqual(event.totalSeats);

    if (bookings.length !== expectedBookingsAfter) {
      // debug info to help trace race conditions if assertions fail

      console.error('Concurrent results:', {
        results,
        bookings,
        successCount,
        expectedBookingsAfter,
      });
    }

    expect(bookings.length).toBe(expectedBookingsAfter);
  });
});
