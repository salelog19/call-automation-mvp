# DECISIONS

## 2026-04-26

- Для MVP строим сервис динамического колтрекинга вокруг цепочки `visit -> source -> shown_number -> call`
- Для хранения данных используем `Supabase`
- `n8n` используем как инструмент webhook-обработки и автоматизаций, а не как ядро бизнес-логики
- Основная логика выдачи подменного номера должна жить в backend-сервисе
- Для MVP достаточно 4 таблиц: `projects`, `tracking_numbers`, `visits`, `calls`
- В MVP сохраняем обязательные поля: `ym_uid`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `shown_phone_number`, `client_phone`, `called_at`
- Для первой версии принимаем предварительное окно закрепления номера за визитом: `30 минут`
- На первом этапе не делаем мультиарендность, биллинг и сложную админку

## 2026-04-27

- Первую SQL-схему фиксируем в `supabase/migrations/20260427_001_init_schema.sql`
- Для первичного ключа во всех основных таблицах используем `UUID` с `gen_random_uuid()`
- Телефонные номера храним как `text`, чтобы не терять форматирование и упростить интеграцию с разными провайдерами
- `provider_call_id` делаем уникальным только когда он передан провайдером
- Для `tracking_numbers.status` на старте фиксируем только два состояния: `active` и `disabled`
- После первичного review нужно проверить целостность связей `project_id <-> tracking_number_id <-> visit_id` на уровне SQL, чтобы исключить межпроектные ошибки атрибуции
- Нужно отдельно зафиксировать правило MVP: один `visit` может иметь только один `call` или несколько `calls`
- Для MVP фиксируем правило: один `visit` может иметь несколько `calls`
- Целостность связей между `projects`, `tracking_numbers`, `visits`, `calls` усиливаем составными foreign key на уровне SQL
- Для backend MVP выбираем стек: `Node.js 24 LTS` + `TypeScript` + `Fastify` + `pg` + `Zod` + `pino`
- С `Supabase` работаем как с Postgres через connection string; бизнес-логику назначения номера и привязки звонка держим в backend, а не в `n8n`
- `POST /assign-number` работает в транзакции: при повторном запросе в той же активной `session_id` возвращаем уже назначенный номер, а не выделяем новый
- Если в пуле нет свободного активного номера, `assign-number` возвращает `409` и `default_phone` проекта как fallback-подсказку для клиента
- `POST /call-webhook` сначала ищет `tracking_number` по `dialed_phone_number`, затем пытается привязать звонок к самому свежему `visit` в окне между `visited_at` и `assignment_expires_at`
- Даже если визит не найден, звонок все равно сохраняется в `calls`; в таком случае `visit_id` остается `null`
- Для первого серверного деплоя используем в Coolify `Dockerfile Build Pack` с `Base Directory = /backend`
