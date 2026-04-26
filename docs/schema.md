# Схема данных MVP

## 1. Общая модель

Для MVP достаточно 4 основных таблиц:

- `projects`
- `tracking_numbers`
- `visits`
- `calls`

## 2. Таблица `projects`

Назначение: хранить сайт или проект, для которого работает колтрекинг.

Поля:

- `id` - UUID, primary key
- `name` - text, название проекта
- `domain` - text, домен сайта
- `default_phone` - text, основной номер без подмены
- `created_at` - timestamptz

## 3. Таблица `tracking_numbers`

Назначение: хранить пул подменных номеров.

Поля:

- `id` - UUID, primary key
- `project_id` - UUID, foreign key -> `projects.id`
- `phone_number` - text, подменный номер
- `status` - text, например `active`, `disabled`
- `last_assigned_at` - timestamptz, когда номер в последний раз выдавался
- `created_at` - timestamptz

Примечание:

На старте достаточно простой модели: номер можно считать доступным, если по нему нет активного закрепления в окне атрибуции.

## 4. Таблица `visits`

Назначение: хранить факт визита и назначение подменного номера.

Поля:

- `id` - UUID, primary key
- `project_id` - UUID, foreign key -> `projects.id`
- `tracking_number_id` - UUID, foreign key -> `tracking_numbers.id`
- `session_id` - text, внутренний идентификатор визита
- `ym_uid` - text
- `landing_url` - text
- `referrer` - text
- `utm_source` - text
- `utm_medium` - text
- `utm_campaign` - text
- `utm_term` - text
- `utm_content` - text
- `shown_phone_number` - text
- `visited_at` - timestamptz
- `assignment_expires_at` - timestamptz
- `created_at` - timestamptz

Примечание:

`shown_phone_number` можно хранить даже при наличии `tracking_number_id`, чтобы упростить аудит, отладку и последующие отчёты.

## 5. Таблица `calls`

Назначение: хранить факт звонка и результат атрибуции.

Поля:

- `id` - UUID, primary key
- `project_id` - UUID, foreign key -> `projects.id`
- `visit_id` - UUID, nullable, foreign key -> `visits.id`
- `tracking_number_id` - UUID, nullable, foreign key -> `tracking_numbers.id`
- `provider_call_id` - text, идентификатор звонка у провайдера
- `called_at` - timestamptz
- `client_phone` - text
- `dialed_phone_number` - text, номер, на который позвонили
- `call_status` - text
- `duration_seconds` - integer, nullable
- `created_at` - timestamptz

## 6. Связи между таблицами

- один `project` имеет много `tracking_numbers`
- один `project` имеет много `visits`
- один `project` имеет много `calls`
- один `tracking_number` может быть назначен многим `visits` во времени
- один `visit` может иметь 0 или 1 связанный звонок в базовом MVP

## 7. Базовая логика атрибуции

При входящем звонке:

1. найти `tracking_number` по `dialed_phone_number`
2. найти в `visits` самый свежий визит:
   - с тем же `tracking_number_id`
   - где `called_at` попадает в интервал между `visited_at` и `assignment_expires_at`
3. записать найденный `visit_id` в таблицу `calls`

Если визит не найден:

- звонок всё равно сохраняется
- `visit_id` остаётся `null`

## 8. Что можно добавить позже

- таблицу `number_assignments`, если понадобится отделить выдачу номера от визита
- таблицу `call_events`, если провайдер присылает несколько событий на один звонок
- таблицу `traffic_sources`, если захочется нормализовать каналы
- админские таблицы пользователей и доступов

## 9. Предварительные SQL-сущности

На уровне проектирования можно ориентироваться на такие сущности:

- `projects`
- `tracking_numbers`
- `visits`
- `calls`

Следующим шагом нужно будет превратить эту схему в SQL для `Supabase`.
