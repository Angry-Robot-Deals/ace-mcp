# 🚀 Автоматическое использование ACE в Cursor AI

## 📋 Обзор

Этот документ описывает, как настроить Cursor AI для автоматического вызова методов ACE и улучшения промптов.

## 🎯 Новые возможности Enhanced ACE MCP Server

### ✨ Умные инструменты:

1. **`ace_smart_generate`** - Автоматически улучшает промпты и генерирует код
2. **`ace_smart_reflect`** - Анализирует код и предлагает улучшения
3. **`ace_context_aware`** - Предоставляет контекстуальные рекомендации
4. **`ace_enhance_prompt`** - Улучшает любой промпт накопленными знаниями

## 🔧 Настройка Enhanced MCP Server

### 1. Обновите конфигурацию Cursor AI

Замените в `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "ace-context-engineering": {
      "command": "npx",
      "args": ["tsx", "$HOME/code/perplexity/ace-mcp-server/src/mcp-server-enhanced.ts"],
      "env": {
        "NODE_ENV": "development",
        "ACE_LOG_LEVEL": "info",
        "ACE_AUTO_ENHANCE": "true",
        "ACE_MAX_PLAYBOOK_SIZE": "10000"
      }
    }
  }
}
```

### 2. Обновите настройки Cursor AI

В `~/Library/Application Support/Cursor/User/settings.json`:

```json
{
  "mcp.servers": {
    "ace-context-engineering": {
      "command": "npx",
      "args": ["tsx", "$HOME/code/perplexity/ace-mcp-server/src/mcp-server-enhanced.ts"],
      "env": {
        "NODE_ENV": "development",
        "ACE_LOG_LEVEL": "info",
        "ACE_AUTO_ENHANCE": "true",
        "ACE_MAX_PLAYBOOK_SIZE": "10000"
      }
    }
  }
}
```

## 🎯 Как использовать автоматические улучшения

### 1. Умная генерация кода

Вместо обычного запроса:
```
Создай функцию для сортировки массива
```

Используйте:
```
@ace_smart_generate создай функцию для сортировки массива
```

**Результат:** ACE автоматически:
- ✅ Добавит релевантные паттерны проектирования
- ✅ Включит лучшие практики
- ✅ Применит накопленные инсайты
- ✅ Предложит оптимизации

### 2. Умный анализ кода

```
@ace_smart_reflect 
```typescript
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[0];
  const left = arr.slice(1).filter(x => x < pivot);
  const right = arr.slice(1).filter(x => x >= pivot);
  return [...quickSort(left), pivot, ...quickSort(right)];
}
```

**Результат:** ACE автоматически:
- 🔍 Проанализирует сложность кода
- 🎯 Выявит потенциальные проблемы
- 💡 Предложит конкретные улучшения
- 📊 Даст оценку качества кода

### 3. Контекстуальная помощь

```
@ace_context_aware как оптимизировать API для высокой нагрузки domain:api
```

**Результат:** ACE предоставит:
- 📚 Релевантные знания из playbook
- 🎯 План действий
- 🔧 Специфичные для API рекомендации
- 📋 Следующие шаги

### 4. Улучшение промптов

```
@ace_enhance_prompt создай REST API для пользователей focus_area:security
```

**Результат:** ACE улучшит промпт:
- 🔒 Добавит соображения безопасности
- 📋 Включит лучшие практики
- 🎯 Применит релевантные паттерны

## 🤖 Автоматические триггеры

### Настройка автоматического вызова

Создайте файл `.cursor/rules` в корне проекта:

```markdown
# ACE Auto-Enhancement Rules

## Code Generation
When user asks to create/implement/build something:
- Automatically use @ace_smart_generate
- Include context from current file/project
- Apply security and performance considerations

## Code Review
When user asks to review/analyze/improve code:
- Automatically use @ace_smart_reflect
- Provide actionable suggestions
- Include quality metrics

## Problem Solving
When user asks how to solve a problem:
- Automatically use @ace_context_aware
- Determine domain from context
- Provide step-by-step guidance

## Prompt Enhancement
For complex requests:
- Automatically use @ace_enhance_prompt
- Focus on relevant areas (security, performance, etc.)
- Include accumulated knowledge
```

## 🎯 Примеры автоматического использования

### Пример 1: Создание API

**Ваш запрос:**
```
Создай endpoint для регистрации пользователей
```

**ACE автоматически:**
1. Вызовет `ace_smart_generate`
2. Улучшит промпт с учетом:
   - Валидации входных данных
   - Хеширования паролей
   - Обработки ошибок
   - Безопасности API
3. Предложит полную реализацию

### Пример 2: Анализ кода

**Ваш запрос:**
```
Проверь этот код на проблемы
```

**ACE автоматически:**
1. Вызовет `ace_smart_reflect`
2. Проанализирует:
   - Сложность кода
   - Потенциальные уязвимости
   - Производительность
   - Соответствие лучшим практикам
3. Предложит конкретные улучшения

## 🔄 Обновление знаний

ACE автоматически обновляет свою базу знаний на основе:
- ✅ Успешных решений
- ❌ Найденных проблем
- 🎯 Паттернов использования
- 📊 Метрик качества

## 🚀 Запуск Enhanced MCP Server

```bash
cd $HOME/code/perplexity/ace-mcp-server

# Остановить старый сервер
pkill -f "mcp-server-simple"

# Запустить enhanced сервер
npx tsx src/mcp-server-enhanced.ts
```

## ✅ Проверка работы

После настройки попробуйте:

```
@ace_smart_generate создай функцию для валидации email
```

Вы должны увидеть:
- 🎯 Улучшенный промпт с лучшими практиками
- 🔧 Рекомендации по реализации
- 📋 План пошагового выполнения
- 💡 Дополнительные инсайты

## 🎉 Результат

После настройки Cursor AI будет:
- 🤖 Автоматически улучшать ваши промпты
- 🎯 Применять накопленные знания
- 💡 Предлагать лучшие решения
- 📊 Учиться на каждом взаимодействии

**ACE превратит Cursor AI в самосовершенствующегося помощника разработчика!** 🚀
