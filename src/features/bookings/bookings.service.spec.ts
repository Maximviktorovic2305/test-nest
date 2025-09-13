import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../../shared/database/prisma.service';
import {
  EventNotFoundException,
  InsufficientSeatsException,
  BookingNotFoundException,
  UnauthorizedBookingException,
} from '../../shared/exceptions/business.exception';

describe('BookingsService', () => {
  let service: BookingsService;
  type AsyncMock<T = any> = jest.Mock<Promise<T>, any[]>;

  type EventDelegate = {
    findUnique: AsyncMock<any>;
    update: AsyncMock<any>;
  };

  type BookingDelegate = {
    create: AsyncMock<any>;
    findUnique: AsyncMock<any>;
    update: AsyncMock<any>;
  };

  type PrismaMock = {
    event: EventDelegate;
    booking: BookingDelegate;
  };

  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = {
      event: {
        findUnique: jest.fn<Promise<any>, any[]>(),
        update: jest.fn<Promise<any>, any[]>(),
      },
      booking: {
        create: jest.fn<Promise<any>, any[]>(),
        findUnique: jest.fn<Promise<any>, any[]>(),
        update: jest.fn<Promise<any>, any[]>(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  it('should create booking when seats available', async () => {
    const userId = 1;
    const createDto = { eventId: 10, seats: 2 };

    prisma.event.findUnique.mockResolvedValue({
      id: 10,
      totalSeats: 100,
      bookedSeats: 10,
    });

    const bookingMock = { id: 5, ...createDto, userId };
    prisma.booking.create.mockResolvedValue(bookingMock);
    prisma.event.update.mockResolvedValue({});

    const result = await service.create(userId, createDto);
    expect(result).toEqual(bookingMock);
    expect(prisma.booking.create).toHaveBeenCalled();
    expect(prisma.event.update).toHaveBeenCalledWith({
      where: { id: createDto.eventId },
      data: { bookedSeats: { increment: createDto.seats } },
    });
  });

  it('should throw EventNotFoundException when event missing', async () => {
    prisma.event.findUnique.mockResolvedValue(null);
    await expect(
      service.create(1, { eventId: 2, seats: 1 }),
    ).rejects.toBeInstanceOf(EventNotFoundException);
  });

  it('should throw InsufficientSeatsException when not enough seats', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 3,
      totalSeats: 5,
      bookedSeats: 4,
    });
    await expect(
      service.create(1, { eventId: 3, seats: 2 }),
    ).rejects.toBeInstanceOf(InsufficientSeatsException);
  });

  it('findOne should throw BookingNotFoundException if not found', async () => {
    prisma.booking.findUnique.mockResolvedValue(null);
    await expect(service.findOne(1, 'user', 99)).rejects.toBeInstanceOf(
      BookingNotFoundException,
    );
  });

  it('findOne should throw UnauthorizedBookingException when user mismatch', async () => {
    prisma.booking.findUnique.mockResolvedValue({
      id: 8,
      userId: 2,
      eventId: 1,
      seats: 1,
    });
    await expect(service.findOne(1, 'user', 8)).rejects.toBeInstanceOf(
      UnauthorizedBookingException,
    );
  });
});
