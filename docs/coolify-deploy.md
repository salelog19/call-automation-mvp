# Первый деплой backend в Coolify

## Что уже готово

- backend лежит в папке `backend/`
- используется собственный `Dockerfile`
- backend слушает `HOST` и `PORT`
- есть `GET /health` для health check

## Какой вариант деплоя выбрать

Для этого проекта лучше использовать `Dockerfile Build Pack`.

Почему:

- у нас уже есть свой `Dockerfile`
- backend живет в подпапке `backend`
- так мы полностью контролируем сборку и запуск контейнера

По документации Coolify для Dockerfile Build Pack:

- можно указать `Base Directory`
- для монорепы нужно указать подпапку, например `/backend`
- порт приложения нужно указать в сетевых настройках

Источники:

- https://coolify.io/docs/applications/build-packs/dockerfile
- https://coolify.io/docs/knowledge-base/environment-variables
- https://coolify.io/docs/knowledge-base/health-checks

## Что заполнить в Coolify

### 1. Repository

- Git provider: GitHub
- Repository: `salelog19/call-automation-mvp`
- Branch: `main`

### 2. Build Pack

- Build Pack: `Dockerfile`
- Base Directory: `/backend`

### 3. Network

- Port Exposes: `3000`

Если backend будет слушать другой порт, здесь нужно поставить тот же номер.

### 4. Environment Variables

Минимально нужны:

```env
DATABASE_URL=postgres://...
HOST=0.0.0.0
PORT=3000
LOG_LEVEL=info
ASSIGNMENT_WINDOW_MINUTES=30
```

Рекомендации:

- `DATABASE_URL` добавить как runtime variable
- `HOST=0.0.0.0` оставить явно
- `PORT=3000` держать совпадающим с настройкой Coolify

## Health Check

Можно использовать встроенный health endpoint:

- Path: `/health`
- Expected code: `200`

Также в `Dockerfile` уже добавлен `HEALTHCHECK`, а по документации Coolify Dockerfile healthcheck имеет приоритет над UI healthcheck, если включены оба.

## Порядок первого деплоя

1. Создать приложение в Coolify
2. Выбрать GitHub-репозиторий `call-automation-mvp`
3. Выбрать `Dockerfile Build Pack`
4. Указать `Base Directory = /backend`
5. Указать порт `3000`
6. Добавить env-переменные
7. Запустить Deploy
8. Проверить логи старта
9. Проверить `GET /health`

## Что проверить после деплоя

- контейнер стартовал без ошибки
- health check проходит
- приложение доступно по домену или временной ссылке
- `GET /health` возвращает:

```json
{
  "ok": true,
  "database": "up"
}
```

## Частые причины проблем

### 1. Неверный Base Directory

Если указать `/` вместо `/backend`, Coolify будет искать `Dockerfile` и `package.json` не там.

### 2. Неверный PORT

Если приложение слушает `3000`, а в Coolify указан другой порт, можно получить `No available server`.

### 3. DATABASE_URL не задан

Тогда backend не сможет пройти проверку базы на `/health`.

### 4. Приложение слушает не `0.0.0.0`

Для контейнера это важно. У нас это уже предусмотрено через `HOST`.

## Следующий шаг после первого успешного деплоя

- пройти [docs/manual-test-scenario.md](/abs/path/c:/ВАЖНО/VS%20CODE/docs/manual-test-scenario.md)
- затем добавить JS-сниппет для подмены номера на сайте
