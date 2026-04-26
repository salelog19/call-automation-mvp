# Git шпаргалка

## Базовые команды

```powershell
git status
```

Показывает, что изменилось в проекте.

```powershell
git add .
```

Добавляет все текущие изменения в следующий коммит.

```powershell
git commit -m "описание изменений"
```

Сохраняет изменения локально.

```powershell
git push
```

Отправляет коммиты на GitHub.

```powershell
git pull
```

Забирает изменения с GitHub.

```powershell
git log --oneline
```

Показывает короткую историю коммитов.

## Обычный порядок работы

```powershell
git status
git add .
git commit -m "обновил документы"
git push
```

## Что писать в `git commit -m`

Пишите коротко и по делу:

- `git commit -m "обновил README"`
- `git commit -m "добавил схему базы"`
- `git commit -m "исправил webhook логику"`
- `git commit -m "обновил MVP описание"`

Хорошее сообщение коммита отвечает на вопрос: что именно изменили.
