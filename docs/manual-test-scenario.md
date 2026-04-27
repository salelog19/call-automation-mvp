# Ручной сценарий проверки MVP

## Цель

Проверить базовую цепочку MVP:

`visit -> assign-number -> visit saved -> call-webhook -> call attribution`

## Что должно быть готово заранее

- В `Supabase` применена миграция из `supabase/migrations/20260427_001_init_schema.sql`
- В таблице `projects` есть тестовый проект
- У тестового проекта есть хотя бы 1-2 активных записи в `tracking_numbers`
- Для backend задан `DATABASE_URL`

## Тестовые данные, которые нужны

### 1. Тестовый проект

Нужны:

- `project.id`
- `default_phone`

### 2. Тестовый подменный номер

Нужен хотя бы один номер в `tracking_numbers`:

- с нужным `project_id`
- со `status = 'active'`

## Шаг 1. Запустить backend локально

В папке `backend`:

```powershell
npm.cmd install
npm.cmd run dev
```

Ожидаемый результат:

- backend стартует без ошибки
- доступны `GET /health`, `POST /assign-number`, `POST /call-webhook`

## Шаг 2. Проверить healthcheck

```powershell
curl http://localhost:3000/health
```

Ожидаемый результат:

```json
{
  "ok": true,
  "database": "up"
}
```

## Шаг 3. Запросить подменный номер

Подставить свой `projectId`:

```powershell
curl -X POST http://localhost:3000/assign-number ^
  -H "Content-Type: application/json" ^
  -d "{\"projectId\":\"PROJECT_UUID\",\"sessionId\":\"session-test-001\",\"ymUid\":\"ym-test-001\",\"landingUrl\":\"https://example.com/landing\",\"referrer\":\"https://google.com\",\"utmSource\":\"google\",\"utmMedium\":\"cpc\",\"utmCampaign\":\"test-campaign\",\"visitedAt\":\"2026-04-27T20:00:00.000Z\"}"
```

Ожидаемый результат:

- ответ `200`
- в ответе есть:
  - `visitId`
  - `trackingNumberId`
  - `shownPhoneNumber`
  - `assignmentExpiresAt`

## Шаг 4. Проверить запись визита в базе

Найти созданный `visit`:

```sql
select
  id,
  project_id,
  tracking_number_id,
  session_id,
  shown_phone_number,
  visited_at,
  assignment_expires_at
from visits
where session_id = 'session-test-001'
order by visited_at desc;
```

Ожидаемый результат:

- есть новая запись в `visits`
- `shown_phone_number` совпадает с ответом `/assign-number`

## Шаг 5. Отправить webhook о звонке

Подставить:

- тот же `projectId`
- номер из `shownPhoneNumber`
- время звонка, попадающее внутрь окна атрибуции

```powershell
curl -X POST http://localhost:3000/call-webhook ^
  -H "Content-Type: application/json" ^
  -d "{\"projectId\":\"PROJECT_UUID\",\"providerCallId\":\"call-test-001\",\"calledAt\":\"2026-04-27T20:10:00.000Z\",\"clientPhone\":\"+375291111111\",\"dialedPhoneNumber\":\"SHOWN_PHONE_NUMBER\",\"callStatus\":\"completed\",\"durationSeconds\":67}"
```

Ожидаемый результат:

- ответ `200`
- в ответе есть:
  - `callId`
  - `trackingNumberId`
  - `visitId`
  - `attributed: true`

## Шаг 6. Проверить запись звонка в базе

```sql
select
  id,
  project_id,
  visit_id,
  tracking_number_id,
  provider_call_id,
  called_at,
  client_phone,
  dialed_phone_number,
  call_status,
  duration_seconds
from calls
where provider_call_id = 'call-test-001';
```

Ожидаемый результат:

- звонок сохранен
- `visit_id` заполнен
- `tracking_number_id` заполнен

## Шаг 7. Проверить отрицательный сценарий

Отправить звонок:

- либо на неизвестный номер
- либо с `calledAt`, который уже вне окна атрибуции

Ожидаемый результат:

- звонок все равно сохраняется
- `visitId = null`
- `attributed = false`

## Что считаем успешной проверкой MVP

- `/assign-number` выдает подменный номер и создает `visit`
- `/call-webhook` сохраняет звонок
- если время и номер совпадают, звонок привязывается к `visit`
- если совпадения нет, звонок все равно не теряется
