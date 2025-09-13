export const BookingSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'integer',
      example: 1,
      description: 'Уникальный идентификатор бронирования',
    },
    userId: {
      type: 'integer',
      example: 1,
      description: 'ID пользователя',
    },
    eventId: {
      type: 'integer',
      example: 1,
      description: 'ID события',
    },
    seats: {
      type: 'integer',
      example: 2,
      description: 'Количество забронированных мест',
    },
    status: {
      type: 'string',
      example: 'confirmed',
      description: 'Статус бронирования',
      enum: ['confirmed', 'cancelled'],
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      example: '2025-09-13T10:00:00.000Z',
      description: 'Дата создания бронирования',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      example: '2025-09-13T10:00:00.000Z',
      description: 'Дата последнего обновления бронирования',
    },
  },
  required: [
    'id',
    'userId',
    'eventId',
    'seats',
    'status',
    'createdAt',
    'updatedAt',
  ],
};
