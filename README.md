# Dynamic Call Tracking MVP

## Workflow

Если вы переключитесь на другой проект или история чата пропадет, контекст можно восстановить по файлам проекта.

Краткая инструкция по работе находится в [WORKFLOW.md](/abs/path/C:/ВАЖНО/VS%20CODE/WORKFLOW.md).

MVP-сервис динамического колтрекинга для подмены телефонного номера на сайте по источнику трафика и сохранения связки:

`visit -> source -> shown_number -> call`

## Цель MVP

Показывать посетителю сайта подменный номер телефона в зависимости от источника трафика и сохранять данные, необходимые для атрибуции звонка:

- `ym_uid`
- дата и время визита
- UTM-метки: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- номер подменного телефона, показанный на сайте
- номер телефона клиента, который позвонил
- дата и время звонка

## Предполагаемый стек

- `VS Code + Codex` - разработка
- `Supabase` - база данных
- `n8n` - webhook и автоматизации
- `Coolify` - деплой backend-сервиса

## Структура проекта

- [docs/mvp.md](/abs/path/c:/ВАЖНО/VS%20CODE/docs/mvp.md) - границы MVP и сценарии
- [docs/schema.md](/abs/path/c:/ВАЖНО/VS%20CODE/docs/schema.md) - схема данных
- [TASKS.md](/abs/path/c:/ВАЖНО/VS%20CODE/TASKS.md) - текущий рабочий план
- [DECISIONS.md](/abs/path/c:/ВАЖНО/VS%20CODE/DECISIONS.md) - журнал решений

## Техническая идея MVP

1. Пользователь заходит на сайт.
2. JS-сниппет считывает UTM-метки, referrer и `ym_uid`.
3. Сниппет запрашивает у backend свободный подменный номер.
4. Backend сохраняет визит в `Supabase` и возвращает номер.
5. Сайт подменяет телефон на странице.
6. Когда поступает звонок, телефония отправляет webhook.
7. Backend или `n8n` сохраняет звонок и связывает его с ранее показанным номером.

## Ближайшая цель

Собрать первую рабочую цепочку:

`visit capture -> number assignment -> phone swap -> call webhook -> attribution`

## Текущая рабочая версия

**Статус:** рабочая версия  
**Время обновления:** 2026-05-06T22:22:30+03:00  
**Изменения:** номер телефона меняется на тестовом сайте, динамическая подмена работает  
**Проверено:** backend deploy, API assign-number, PostgreSQL, tracking numbers, visits, dynamic number assignment


# Security TODO / Production Hardening

## Текущие временные решения

На этапе MVP PostgreSQL был открыт наружу через public port 5432 для упрощения подключения backend контейнера.

Текущая схема подключения:

* Backend подключается к PostgreSQL по IP сервера
* DATABASE_URL использует внешний адрес сервера
* PostgreSQL доступен публично

Это временное решение и не должно оставаться в production.

---

## Что нужно сделать позже

### 1. Убрать public доступ к PostgreSQL

Не использовать:

* Public Port 5432
* Прямой доступ к PostgreSQL через IP сервера

Вместо этого:

* использовать private docker network
  или
* internal container hostname
  или
* VPN/Tailscale
  или
* firewall allowlist

---

### 2. Перенести backend и PostgreSQL в одну docker network

Чтобы backend подключался по internal hostname:

```env
DATABASE_URL=postgresql://postgres:PASSWORD@supabase-db:5432/postgres
```

---

### 3. Сменить PostgreSQL password

Текущий пароль использовался в логах и тестах разработки.

Нужно:

* сгенерировать новый strong password
* обновить password во всех Supabase сервисах одновременно
* обновить DATABASE_URL backend

Важно:
У self-hosted Supabase пароль PostgreSQL используется несколькими сервисами:

* auth
* analytics
* rest
* storage
* realtime
* studio

Смена пароля только в postgres ломает stack.

---

### 4. Убрать секреты из логов и чатов

Никогда не публиковать:

* DATABASE_URL
* PostgreSQL password
* Coolify keys
* API keys
* JWT secrets

---

### 5. Добавить firewall правила

Ограничить доступ:

* только backend контейнеру
  или
* только trusted IP

---

### 6. Настроить backup PostgreSQL

Добавить:

* автоматические backup
* retention policy
* проверку восстановления backup

---

## Текущий статус

MVP работает:

* backend deploy
* API assign-number
* PostgreSQL
* tracking numbers
* visits
* dynamic number assignment

Security hardening отложен до стабилизации MVP.
