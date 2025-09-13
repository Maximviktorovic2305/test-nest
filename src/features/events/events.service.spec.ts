import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../../shared/database/prisma.service';

describe('EventsService', () => {
  let service: EventsService;
  let mockCreate: jest.Mock;

  beforeEach(async () => {
    // Create a mock for the create method
    mockCreate = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: {
            event: {
              create: mockCreate,
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an event', async () => {
      const createEventDto = {
        title: 'Test Event',
        description: 'Test Description',
        date: new Date().toISOString(),
        location: 'Test Location',
        totalSeats: 100,
      };

      const mockEvent = {
        id: 1,
        ...createEventDto,
        bookedSeats: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Use the mock directly without referencing unbound methods
      mockCreate.mockResolvedValue(mockEvent);

      const result = await service.create(createEventDto);

      expect(result).toEqual(mockEvent);
      expect(mockCreate).toHaveBeenCalledWith({
        data: createEventDto,
      });
    });
  });
});
