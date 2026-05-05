# Итоги MVP Колтрекинга

## ✅ Выполнено

### Backend (задеплоен и работает)
- Задеплоен в Coolify: `http://xc52y96c5mwkh4tkh9nx9s89.176.31.78.108.sslip.io`
- Healthcheck: `{"database":"up","ok":true}`
- `POST /assign-number` — выдаёт `visitId`, `trackingNumberId`, `shownPhoneNumber`
- `POST /call-webhook` — сохраняет звонок с атрибуцией
- База данных Supabase подключена (сеть `r9nejr488xlvrw3rwepooir9`)

### Frontend (JS-сниппет)
- `frontend/ct-snippet.js` — динамическая подмена номера
- `frontend/demo.html` — демо-страница с реальным `projectId`
- `frontend/README.md` — документация

### Телефония и автоматизация
- `docs/telephony-setup.md` — гайд по выбору провайдера
- `n8n/call-webhook-workflow.json` — шаблон workflow для обработки webhook
- `test-full-cycle.sh` — скрипт для проверки полного цикла

### Документация
- `README.md`, `TASKS.md`, `DECISIONS.md` — актуальное состояние
- `docs/mvp.md`, `docs/schema.md`, `docs/manual-test-scenario.md`
- Все файлы закоммичены и отправлены в репозиторий

## 📋 Следующие шаги

### 1. Протестировать на реальном сайте
```bash
# Открыть demo.html с UTM-метками
demo.html?utm_source=google&utm_medium=cpc&utm_campaign=test

# В консоли браузера должны появиться логи:
# [CT] Initializing call tracking...
# [CT] Swapped phone numbers to: +79001234567
```

### 2. Настроить телефонию (рекомендуется Zadarma)
1. В личном кабинете Zadarma: Настройки → Уведомления → Webhooks
2. URL: `https://xc52y96c5mwkh4tkh9nx9s89.176.31.78.108.sslip.io/call-webhook`
3. События: `NEW_RINGING`, `HANGUP`

### 3. Протестировать полный цикл
```bash
# Запустить скрипт проверки (на сервере)
bash test-full-cycle.sh

# Или вручную через curl:
curl -X POST https://xc52y96c5mwkh4tkh9nx9s89.176.31.78.108.sslip.io/call-webhook \
  -H "Content-Type: application/json" \
  -d '{"projectId":"28ada9a2-6a05-4847-8aba-d51bcec3f4b6","trackingNumberId":"f94ec95c-7af2-427f-bf0c-ca535fff7c5d","visitId":"e0a1d894-79e0-4f7f-972e-c58c19286cc4","clientPhone":"+79007654321","calledAt":"2026-05-05T08:30:00.000Z","callStatus":"completed","durationSeconds":120}'
```

### 4. Интеграция с n8n (опционально)
1. Импортировать `n8n/call-webhook-workflow.json` в n8n
2. Настроить `Project_ID` и `Telegram Chat ID`
3. Подключить webhook от телефонии к n8n

## 🎯 Статус проекта
**MVP считается рабочим**, если:
- ✅ При заходе на сайт номер меняется
- ✅ В базу сохраняются `ym_uid`, UTM-метки, показанный номер
- ✅ При звонке звонок сохраняется и атрибутируется к визиту

**Все файлы находятся в репозитории:**
`https://github.com/salelog19/call-automation-mvp`
