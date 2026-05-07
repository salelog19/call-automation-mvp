# WORKFLOW

# Зачем нужен этот файл

Этот файл нужен, чтобы проект не "жил только в чате".

Если:

* переписка потеряется
* сменится VS Code окно
* сменится проект
* сбросится контекст агента

то состояние проекта можно восстановить по файлам репозитория.

Главное правило:

Чат ≠ память проекта.

Постоянная память проекта:

* markdown файлы
* структура проекта
* код
* decisions
* tasks
* schema

---

# Основной workflow проекта

Проект развивается маленькими безопасными шагами.

Предпочтительный цикл работы:

1. Architect → анализ и план
2. Builder → минимальная реализация
3. QA → проверка flow и edge cases
4. Docs Update → фиксация состояния проекта

---

# AI Roles Workflow

## 1. Architect

Роль:

* анализировать задачу
* предлагать минимальный scope
* определять риски
* определять нужные файлы
* не писать код сразу

Architect:

* избегает overengineering
* не предлагает massive rewrites
* дробит задачи на маленькие этапы
* следит за consistency проекта

---

## 2. Builder

Роль:

* реализовать минимальное решение
* менять только нужные файлы
* не делать massive refactor
* следовать текущей архитектуре

Builder:

* сначала пишет план
* потом код
* потом verification steps

---

## 3. QA Reviewer

Роль:

* проверять browser flow
* проверять API
* проверять DB consistency
* искать regressions
* искать edge cases

QA:

* сначала ищет root cause
* потом предлагает minimal fix
* не пишет новый функционал без запроса

---

# Scope Control

Для каждой задачи:

* делать минимальный scope
* ограничивать список файлов
* избегать giant rewrites
* не менять unrelated code
* делать deploy-safe изменения

Предпочтительно:

* incremental development
* backend-first approach
* маленькие независимые задачи

---

# Practical Development Cycle

Хороший цикл работы:

1. Сформулировать задачу.
2. Попросить Architect сделать minimal plan.
3. Реализовать только один маленький этап.
4. Проверить flow через QA.
5. Обновить документацию.
6. Только потом переходить дальше.

---

# Какие файлы за что отвечают

## Основные файлы

* `README.md`

  * overview проекта
  * текущий статус
  * цели проекта

* `AI_CONTEXT.md`

  * текущая архитектура
  * stack
  * правила проекта
  * priorities
  * current phase

* `TASKS.md`

  * текущие задачи
  * backlog
  * next steps
  * completed tasks

* `DECISIONS.md`

  * принятые архитектурные решения
  * причины решений

---

## Docs

* `docs/mvp.md`

  * границы MVP

* `docs/schema.md`

  * схема данных
  * таблицы
  * связи

* `docs/admin-panel.md`

  * будущий admin UI
  * dashboard
  * analytics

* `docs/roadmap.md`

  * этапы развития проекта

---

# Stable Working Components

Сейчас стабильно работают:

* dynamic phone swap
* assign-number API
* visits insertion
* tracking number reservation
* GTM snippet loading
* backend deploy
* Supabase connection

Не ломать эти flows без необходимости.

---

# Dangerous Areas

Любые изменения требуют осторожности:

* assign-number flow
* tracking_numbers allocation
* phones.js snippet
* Dockerfile
* Coolify deploy
* package-lock.json
* PostgreSQL connection
* CORS

Любые risky changes сначала объяснять.

---

# Engineering Style

Предпочтения проекта:

* simple architecture
* readable code
* explicit logic
* minimal abstractions
* predictable behavior
* small incremental changes

Избегать:

* overengineering
* giant abstractions
* premature optimization
* magic behavior
* unnecessary frameworks

---

# Definition Of Done

Задача считается завершенной только если:

* код собирается
* deploy проходит успешно
* endpoint отвечает
* browser flow работает
* нет console errors
* нет network errors
* DB работает корректно
* есть минимальная инструкция проверки
* документация обновлена

---

# Минимальная привычка после каждой полезной сессии

В конце работы просить:

* `Обнови документацию по итогам`
* `Сохрани решения в DECISIONS.md и следующие шаги в TASKS.md`
* `Зафиксируй текущее состояние проекта`

---

# Что делать перед переключением на другой проект

Перед уходом фиксировать:

* что уже сделано
* что делать следующим шагом
* какие есть открытые вопросы

Удобная команда:

`Сделай status snapshot проекта и обнови TASKS.md / DECISIONS.md`

---

# Что делать при возвращении в проект

Если контекст потерялся:

`Восстанови контекст проекта по файлам и продолжим`

Агент должен:

1. прочитать AI_CONTEXT.md
2. прочитать TASKS.md
3. прочитать DECISIONS.md
4. восстановить current state проекта

---

# Что не стоит делать

* не хранить решения только в чате
* не делать giant rewrites
* не прыгать в код без плана
* не делать большие refactor без необходимости
* не менять unrelated files
* не усложнять MVP раньше времени

---

# Текущие приоритеты проекта

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
* enterprise scaling
* advanced auth
* premature optimization
