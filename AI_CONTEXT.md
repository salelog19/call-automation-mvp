# Project Context 07/05/2025

Проект:
dynamic call tracking MVP.

Текущий стек:

* Node.js
* TypeScript
* Fastify
* PostgreSQL
* Supabase
* Docker
* Coolify
* GTM snippet

Текущая рабочая функциональность:

* dynamic phone swap
* assign-number API
* tracking numbers pool
* visits storage
* UTM tracking
* session tracking
* number reservation window
* dynamic number insertion on website

Уже работает:
visit → assign-number → shown number → visits table

Еще НЕ реализовано:

* telephony integration
* call attribution
* admin panel
* analytics dashboard

Главная цель текущего этапа:
построить admin/analytics foundation поверх working attribution engine.

Архитектурные правила:

* не делать massive refactor
* не ломать MVP
* минимальные изменения
* incremental development
* backend-first approach
* deploy-safe changes
* avoid overengineering

Рабочий workflow:

1. architect → planning
2. builder → implementation
3. qa → verification

Всегда:

* сначала анализ
* потом минимальный implementation
* потом verification

Не переписывать unrelated files.
Не усложнять архитектуру раньше времени.
#1 Stable Working Components

Сейчас стабильно работают:

* dynamic phone swap
* assign-number API
* visits insertion
* tracking number reservation
* GTM snippet loading
* backend deploy
* Supabase connection

Не ломать эти flows без необходимости.
<environment_details>
Current time: 2026-05-07T20:23:44+03:00
Open tabs:
  .kilocode/skills/git-commit/SKILL.md
  backend/public/phones.js
  backend/src/app.ts
  backend/src/routes/assign-number.ts
</environment_details>