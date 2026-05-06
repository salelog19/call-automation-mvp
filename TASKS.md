# TASKS (Статус проекта)

## ✅ Выполнено

### Backend (готов)
- Бэкенд задеплоен и работает: `https://api.proaudio.by/health` → `{"service":"call-automation-mvp-backend","status":"ok"}`
- Реализованы эндпоинты:
  - `GET /health` — проверка здоровья
  - `POST /assign-number` — назначение номера
  - `POST /call-webhook` — обработка звонков
  - `GET /api/number` — получение назначенного номера (новый)
- Dockerfile упрощен (single-stage), исправлены зависимости
- Подключение к Supabase настроено (сеть `r9nejr488xlvrw3rwepooir9`)

### Frontend (готов)
- Создан JS-скрипт: `frontend/ct-snippet.js` (стандартный)
- Создан компактный скрипт: `frontend/phones.js` (для GTM)
- Создана демо-страница: `frontend/demo.html`
- Создана документация: `frontend/README.md`

### Документация
- `README.md`, `TASKS.md`, `DECISIONS.md` — актуальное состояние
- `docs/mvp.md`, `docs/schema.md`, `docs/manual-test-scenario.md`
- `docs/telephony-setup.md` — гайд по телефонии
- `docs/MVP-SUMMARY.md` — итоговая сводка

### Инфраструктура
- Coolify настроен, домен `api.proaudio.by` проксируется
- Supabase запущен, база данных доступна
- n8n workflow шаблон: `n8n/call-webhook-workflow.json`

## ❌ Проблемы

1. **Coolify не видит новые коммиты** (API возвращает "Not found")
2. **Деплой падает** из-за конфликтов `package-lock.json`
3. **Эндпоинты недоступны** через `api.proaudio.by` (404)

## 🎯 Следующие шаги

### 1. Задеплоить бэкенд (приоритет)
- Зайти в **Coolify UI**: `http://176.31.78.108:8000/project/e3270mri4sg3jlu93f24rmog/environment/invidqset9vy5zucfhn28iq9`
- Нажать **Deploy** → **Force rebuild** (обязательно!)
- Дождаться успешного завершения
- Проверить: `curl -I https://api.proaudio.by/health`

### 2. Протестировать API
```bash
# Назначение номера
curl -X POST https://api.proaudio.by/assign-number \
  -H "Content-Type: application/json" \
  -d '{"projectId":"28ada9a2-6a05-4847-8aba-d51bcec3f4b6","sessionId":"test-session","ymUid":"ym-123"}'

# Получение номера
curl https://api.proaudio.by/api/number?projectId=28ada9a2-6a05-4847-8aba-d51bcec3f4b6&sessionId=test-session
```

### 3. Установить на сайт (profitx.by)
Через Google Tag Manager:
```html
<script async src="https://api.proaudio.by/scripts/phones.js?28ada9a2-6a05-4847-8aba-d51bcec3f4b6"></script>
```

### 4. Настроить телефонию
- Выбрать провайдера (Zadarma, SIP-транк)
- Настроить webhook → `https://api.proaudio.by/call-webhook`

## 📊 Итоговое состояние
**Бэкенд готов к работе**, но нужно:
1. Успешно задеплоить в Coolify (Force rebuild)
2. Протестировать эндпоинты через домен
3. Установить скрипт на сайт

**Все файлы находятся в репозитории:**
`https://github.com/salelog19/call-automation-mvp`
