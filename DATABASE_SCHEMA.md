# Документация схемы базы данных

## Обзор
Этот документ описывает схему базы данных для системы бронирования событий. Система использует MySQL в качестве базы данных и Prisma ORM для операций с базой данных.

## Диаграмма связей сущностей
```
User 1 ----< Booking >---- 1 Event
```

## Таблицы

### 1. User (Пользователь)
Представляет пользователя в системе.

| Колонка | Тип | Ограничения | Описание |
|--------|------|-------------|-------------|
| id | Int | PK, Auto-increment | Уникальный идентификатор |
| email | String | Unique | Email адрес пользователя |
| password | String | Not null | Хэшированный пароль |
| name | String | Nullable | Имя пользователя |
| role | String | Default: "user" | Роль пользователя (user/admin) |
| createdAt | DateTime | Default: now() | Временная метка создания |
| updatedAt | DateTime | updatedAt | Временная метка последнего обновления |

### 2. Event (Событие)
Представляет событие, которое можно забронировать.

| Колонка | Тип | Ограничения | Описание |
|--------|------|-------------|-------------|
| id | Int | PK, Auto-increment | Уникальный идентификатор |
| title | String | Not null | Название события |
| description | String | Nullable | Описание события |
| date | DateTime | Not null | Дата и время события |
| location | String | Not null | Место проведения события |
| totalSeats | Int | Not null | Общее количество доступных мест |
| bookedSeats | Int | Default: 0 | Количество забронированных мест |
| createdAt | DateTime | Default: now() | Временная метка создания |
| updatedAt | DateTime | updatedAt | Временная метка последнего обновления |

### 3. Booking (Бронирование)
Представляет бронирование, сделанное пользователем для события.

| Колонка | Тип | Ограничения | Описание |
|--------|------|-------------|-------------|
| id | Int | PK, Auto-increment | Уникальный идентификатор |
| userId | Int | FK to User.id | Ссылка на пользователя |
| eventId | Int | FK to Event.id | Ссылка на событие |
| seats | Int | Not null | Количество забронированных мест |
| status | String | Default: "confirmed" | Статус бронирования |
| createdAt | DateTime | Default: now() | Временная метка создания |
| updatedAt | DateTime | updatedAt | Временная метка последнего обновления |

## Связи

1. **Пользователь к Бронированию**: Один-ко-Многим
   - Один пользователь может иметь много бронирований
   - Каждое бронирование принадлежит одному пользователю

2. **Событие к Бронированию**: Один-ко-Многим
   - Одно событие может иметь много бронирований
   - Каждое бронирование принадлежит одному событию

3. **Пользователь к Событию**: Многие-ко-Многим (через Бронирование)
   - Пользователи могут бронировать несколько событий
   - События могут быть забронированы несколькими пользователями

## Индексы

1. **User (Пользователь)**
   - Первичный ключ: id
   - Уникальный: email

2. **Event (Событие)**
   - Первичный ключ: id
   - Индекс: date (для сортировки событий по дате)

3. **Booking (Бронирование)**
   - Первичный ключ: id
   - Уникальный: userId + eventId (предотвращает дублирующие бронирования)
   - Внешний ключ: userId → User.id
   - Внешний ключ: eventId → Event.id

## Ограничения

1. **Ограничения внешних ключей**
   - Booking.userId ссылается на User.id
   - Booking.eventId ссылается на Event.id

2. **Проверочные ограничения**
   - Booking.seats > 0
   - Event.totalSeats > 0
   - Event.bookedSeats <= Event.totalSeats

## Триггеры

Бизнес-логика приложения обрабатывает следующие правила:
1. При создании бронирования увеличивать Event.bookedSeats на количество забронированных мест
2. При отмене бронирования уменьшать Event.bookedSeats на количество мест в бронировании
3. Перед созданием бронирования проверять, что доступно достаточное количество мест

## Схема Prisma

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String?
  role      String   @default("user")
  bookings  Booking[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Event {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  date        DateTime
  location    String
  totalSeats  Int
  bookedSeats Int       @default(0)
  bookings    Booking[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Booking {
  id        Int      @id @default(autoincrement())
  userId    Int
  eventId   Int
  user      User     @relation(fields: [userId], references: [id])
  event     Event    @relation(fields: [eventId], references: [id])
  seats     Int
  status    String   @default("confirmed") // confirmed, cancelled
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, eventId])
}
```