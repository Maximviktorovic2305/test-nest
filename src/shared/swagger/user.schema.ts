export const UserSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'integer',
      example: 1,
      description: 'Уникальный идентификатор пользователя',
    },
    email: {
      type: 'string',
      example: 'user@example.com',
      description: 'Email пользователя',
    },
    name: {
      type: 'string',
      example: 'Иван Иванов',
      description: 'Имя пользователя',
    },
    role: {
      type: 'string',
      example: 'user',
      description: 'Роль пользователя',
      enum: ['user', 'admin'],
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      example: '2025-09-13T10:00:00.000Z',
      description: 'Дата создания пользователя',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      example: '2025-09-13T10:00:00.000Z',
      description: 'Дата последнего обновления пользователя',
    },
  },
  required: ['id', 'email', 'name', 'role', 'createdAt', 'updatedAt'],
};
