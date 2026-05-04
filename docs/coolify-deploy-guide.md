# Инструкция по деплою в Coolify

## Предварительные требования
1. Coolify уже установлен на сервере
2. Supabase настроен и доступен
3. Репозиторий https://github.com/salelog19/call-automation-mvp доступен

## Шаги для деплоя через веб-интерфейс Coolify

### 1. Создать приложение
- Зайти в Coolify
- Нажать "Create new application"
- Выбрать "Public Git Repository"
- Repository: `salelog19/call-automation-mvp`
- Branch: `main`

### 2. Настроить Build Pack
- Build Pack: `Dockerfile`
- Base Directory: `/backend`
- Dockerfile location: оставить пустым (по умолчанию `Dockerfile` в base directory)

### 3. Настроить сеть
- Port Exposes: `3000`
- Это должно совпадать с PORT в переменных окружения

### 4. Переменные окружения
Добавить в разделе "Environment Variables":

```env
DATABASE_URL=postgres://postgres:[password]@[supabase-host]:5432/postgres
HOST=0.0.0.0
PORT=3000
LOG_LEVEL=info
ASSIGNMENT_WINDOW_MINUTES=30
```

⚠️ Важно: `DATABASE_URL` должен указывать на ваш Supabase инстанс.
Формат: `postgresql://postgres:[password]@[supabase-host]:5432/postgres`

Для Supabase формат обычно:
`postgresql://postgres:[your-password]@db.[your-project].supabase.co:5432/postgres`

### 5. Health Check
- Path: `/health`
- Expected code: `200`
- Или использовать встроенный HEALTHCHECK из Dockerfile

### 6. Деплой
- Нажать "Deploy"
- Следить за логами
- Убедиться, что контейнер запустился

### 7. Проверка
После успешного деплоя:
```bash
curl https://[your-coolify-domain]/health
```

Ожидаемый ответ:
```json
{
  "ok": true,
  "database": "up"
}
```

## Альтернативный вариант: через API Coolify

Если есть API токен Coolify, можно создать приложение через API:

```bash
curl -X POST https://[coolify-host]/api/v1/applications/public \
  -H "Authorization: Bearer [your-api-token]" \
  -H "Content-Type: application/json" \
  -d '{
    "project_uuid": "[project-uuid]",
    "server_uuid": "[server-uuid]",
    "git_repository": "salelog19/call-automation-mvp",
    "git_branch": "main",
    "build_pack": "dockerfile",
    "base_directory": "/backend",
    "ports_exposes": "3000",
    "instant_deploy": true
  }'
```

## Возможные проблемы

1. **Ошибка подключения к БД**: Проверьте DATABASE_URL и убедитесь, что Supabase доступен из контейнера
2. **Порт недоступен**: Убедитесь, что PORT=3000 и в Coolify указан порт 3000
3. **Base Directory**: Уболжен быть `/backend`, а не `/`
4. **Health check fails**: Проверьте, что приложение слушает на 0.0.0.0, а не на 127.0.0.1

## Следующие шаги после деплоя
1. Протестировать `POST /assign-number`
2. Протестировать `POST /call-webhook`
3. Настроить n8n для приема webhook от телефонии
4. Добавить JS-сниппет на сайт
