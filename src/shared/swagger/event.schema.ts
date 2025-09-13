export const EventSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'integer',
      example: 1,
      description: 'Уникальный идентификатор события',
    },
    title: {
      type: 'string',
      example: 'Концерт группы XYZ',
      description: 'Название события',
    },
    description: {
      type: 'string',
      example: 'Ежегодный концерт популярной группы XYZ',
      description: 'Описание события',
    },
    date: {
      type: 'string',
      format: 'date-time',
      example: '2025-12-31T20:00:00.000Z',
      description: 'Дата события',
    },
    location: {
      type: 'string',
      example: 'Концертный зал им. Чайковского, Москва',
      description: 'Место проведения события',
    },
    totalSeats: {
      type: 'integer',
      example: 100,
      description: 'Общее количество мест на событие',
    },
    bookedSeats: {
      type: 'integer',
      example: 0,
      description: 'Количество забронированных мест',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      example: '2025-09-13T10:00:00.000Z',
      description: 'Дата создания события',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      example: '2025-09-13T10:00:00.000Z',
      description: 'Дата последнего обновления события',
    },
  },
  required: [
    'id',
    'title',
    'date',
    'location',
    'totalSeats',
    'bookedSeats',
    'createdAt',
    'updatedAt',
  ],
};
