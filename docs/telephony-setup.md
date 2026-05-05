# Настройка телефонии и webhook

## Цель
Настроить телефонию так, чтобы при звонке она отправляла webhook на наш backend.

## Популярные провайдеры с webhooks

### 1. Zadarma (Россия/СНГ)
- Поддерживает webhooks при звонке
- Документация: https://zadarma.com/support/ru/api
- Webhook события: `NEW_RINGING`, `HANGUP`

### 2. SIP-транки (SIPNET, МТТ и др.)
- Требуют настройки АТС (Asterisk, FreePBX)
- Webhook настраивается через диалплан АТС

### 3. Локальная АТС (Asterisk / FreePBX)
- Полный контроль
- Webhook через `Curl` в диалплане

## Настройка webhook (пример с Zadarma)

### 1. Получить URL бэкенда
```
https://xc52y96c5mwkh4tkh9nx9s89.176.31.78.108.sslip.io/call-webhook
```

### 2. В личном кабинете Zadarma
1. Перейти в **Настройки** → **Уведомления** → **Webhooks**
2. Добавить новый webhook:
   - URL: `https://xc52y96c5mwkh4tkh9nx9s89.176.31.78.108.sslip.io/call-webhook`
   - События: `NEW_RINGING`, `HANGUP`
   - Format: JSON

### 3. Формат данных от Zadarma (пример)
```json
{
  "event": "NEW_RINGING",
  "call_id": "12345",
  "caller_id": "+79001234567",
  "called_did": "+74951234567",
  "timestamp": "2026-05-05T08:30:00Z"
}
```

## Адаптация под наш бэкенд

В текущем `/call-webhook` мы ожидаем:
```json
{
  "projectId": "UUID",
  "calledAt": "2026-05-05T08:30:00.000Z",
  "clientPhone": "+79001234567",
  "dialedPhoneNumber": "+74951234567",
  "callStatus": "ringing",
  "durationSeconds": null,
  "providerCallId": "12345"
}
```

### Нужен middleware (в n8n или в коде)

Создать прослойку, которая преобразует формат Zadarma → наш формат.

## Вариант 1: Через n8n (рекомендуется)

1. Создать workflow в n8n
2. Webhook trigger (принимает от Zadarma)
3. Function node (преобразует поля):
   ```javascript
   const event = $input.all()[0].json;
   return [{
     json: {
       projectId: $('Project_ID'), // настроить в n8n
       calledAt: new Date().toISOString(),
       clientPhone: event.caller_id || '',
       dialedPhoneNumber: event.called_did || '',
       callStatus: event.event === 'HANGUP' ? 'completed' : 'ringing',
       durationSeconds: null, // Zadarma может передать в HANGUP
       providerCallId: event.call_id || ''
     }
   }];
   ```
4. HTTP Request node → POST `https://xc52y96c5mwkh4tkh9nx9s89.176.31.78.108.sslip.io/call-webhook`

## Вариант 2: Напрямую в бэкенд

Если провайдер позволяет настроить тело webhook, можно отправлять сразу в наш формат.

Или создать отдельный endpoint в бэкенде: `/webhook/zadarma` который будет принимать их формат и преобразовывать.

## Следующие шаги

1. **Выбрать провайдера** (рекомендуется Zadarma для РФ/СНГ)
2. **Настроить webhook** в кабинете провайдера
3. **Создать n8n workflow** для трансформации данных (или адаптировать бэкенд)
4. **Протестировать** полный цикл: звонок → webhook → сохранение в БД → атрибуция

## Для тестирования (без реальной телефонии)

Можно имитировать звонок через curl:
```bash
curl -X POST https://xc52y96c5mwkh4tkh9nx9s89.176.31.78.108.sslip.io/call-webhook \
  -H "Content-Type: application/json" \
  -d '{"projectId":"<PROJECT_UUID>","calledAt":"2026-05-05T08:30:00.000Z","clientPhone":"+79007654321","dialedPhoneNumber":"+79001234567","callStatus":"completed","durationSeconds":120,"providerCallId":"test-call-001"}'
```

## Статус
- [ ] Выбран провайдер телефонии
- [ ] Настроен webhook в кабинете провайдера
- [ ] Создан n8n workflow (или добавлен endpoint в бэкенд)
- [ ] Протестирован полный цикл
