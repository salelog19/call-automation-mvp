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
#2 Dangerous Areas

Любые изменения требуют осторожности:

* assign-number flow
* tracking_numbers allocation
* Dockerfile
* Coolify deploy
* package-lock.json
* phones.js snippet
* CORS
* PostgreSQL connection

Любые risky changes сначала объяснять.


3. Allowed Scope Control

Менять только файлы, необходимые для текущей задачи.

Не:

переименовывать архитектуру
менять unrelated endpoints
переписывать working flows
менять deployment без необходимости

Минимальный viable change preferred.

4. Preferred engineering style

# Engineering Style

Предпочтения проекта:

* simple architecture
* readable code
* backend-first
* minimal abstractions
* explicit SQL
* explicit flows
* predictable behavior
* small incremental changes

Избегать:

* overengineering
* generic frameworks
* giant abstractions
* magic behavior

5. Definition of Done

# Definition Of Done

Задача считается завершенной только если:

* code compiles
* deploy succeeds
* endpoint responds
* browser flow works
* no console errors
* no network errors
* DB insertion works
* minimal verification steps provided

6. Current priorities

# Current Priorities

Текущий фокус:

1. stable attribution engine
2. admin analytics foundation
3. visits visibility
4. tracking numbers management
5. telephony integration later

Сейчас НЕ приоритет:

* billing
* multi-tenancy
* microservices
* advanced auth
* scaling optimization
* enterprise features
<environment_details>
Current time: 2026-05-07T20:27:18+03:00
Open tabs:
  .kilocode/skills/git-commit/SKILL.md
  backend/public/phones.js
  backend/src/app.ts
  backend/src/routes/assign-number.ts
</environment_details>