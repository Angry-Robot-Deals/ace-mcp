# 🎯 Настройка ACE MCP в Cursor AI

## 📋 Пошаговая инструкция

### 1. 🚀 Запуск ACE MCP сервера

Сначала убедитесь, что ACE MCP сервер запущен локально:

```bash
cd $HOME/code/perplexity/ace-mcp-server
docker-compose -f docker-compose.dev.yml up -d
```

Проверьте статус:
```bash
curl http://localhost:34301/health
```

### 2. 🔧 Настройка Cursor AI

#### Вариант A: Через настройки Cursor

1. Откройте **Cursor AI**
2. Перейдите в **Settings** (⌘ + ,)
3. Найдите раздел **MCP Servers** или **Extensions**
4. Добавьте новый MCP сервер с настройками:

```json
{
  "name": "ACE Context Engineering",
  "command": "npx",
  "args": ["tsx", "src/index.ts"],
  "cwd": "$HOME/code/perplexity/ace-mcp-server",
  "env": {
    "LLM_PROVIDER": "deepseek",
    "API_BEARER_TOKEN": "token",
    "ACE_SERVER_PORT": "34301",
    "ACE_CONTEXT_DIR": "$HOME/code/perplexity/ace-mcp-server/contexts",
    "ACE_MAX_PLAYBOOK_SIZE": "10000"
  }
}
```

#### Вариант B: Через конфигурационный файл

1. Найдите конфигурационный файл Cursor:
   - **macOS**: `~/Library/Application Support/Cursor/User/settings.json`
   - **Linux**: `~/.config/Cursor/User/settings.json`
   - **Windows**: `%APPDATA%\Cursor\User\settings.json`

2. Добавьте в файл настройки MCP:

```json
{
  "mcp.servers": {
    "ace-context-engineering": {
      "command": "npx",
      "args": ["tsx", "src/index.ts"],
      "cwd": "$HOME/code/perplexity/ace-mcp-server",
      "env": {
        "LLM_PROVIDER": "deepseek",
        "API_BEARER_TOKEN": "token",
        "ACE_SERVER_PORT": "34301",
        "ACE_CONTEXT_DIR": "$HOME/code/perplexity/ace-mcp-server/contexts",
        "ACE_MAX_PLAYBOOK_SIZE": "10000"
      }
    }
  }
}
```

### 3. 🔄 Перезапуск Cursor AI

После добавления конфигурации:
1. Полностью закройте Cursor AI
2. Запустите снова
3. Проверьте в логах, что MCP сервер подключился

### 4. ✅ Проверка подключения

В Cursor AI попробуйте использовать команды:

```
@ace-context-engineering generate a Python function for sorting
```

или

```
@ace-context-engineering reflect on this code: def sort_list(arr): return sorted(arr)
```

## 🎯 Доступные команды ACE MCP

### 📝 Generator
```
@ace generate <prompt>
```
Генерирует траектории разработки на основе промпта.

### 🧠 Reflector  
```
@ace reflect <code>
```
Анализирует код и создает инсайты для улучшения.

### 📚 Curator
```
@ace curate <insights>
```
Обновляет Playbook с новыми знаниями.

### 📖 Playbook
```
@ace playbook
```
Показывает текущий Playbook с паттернами и best practices.

## 🔧 Настройки окружения

Убедитесь, что установлены зависимости:

```bash
# В директории проекта
npm install -g tsx
npm install
```

## 🐛 Устранение неполадок

### Проблема: MCP сервер не подключается
**Решение**: 
1. Проверьте, что Docker контейнеры запущены
2. Убедитесь, что порт 34301 свободен
3. Проверьте правильность путей в конфигурации

### Проблема: Ошибка аутентификации
**Решение**:
1. Проверьте Bearer token в `.env` файле
2. Убедитесь, что токен совпадает в конфигурации Cursor

### Проблема: Команды не работают
**Решение**:
1. Перезапустите Cursor AI
2. Проверьте логи MCP сервера: `docker logs ace-mcp-server-dev`
3. Убедитесь, что используете правильный синтаксис команд

## 📊 Мониторинг

Для мониторинга работы ACE MCP:

1. **Dashboard**: http://localhost:34300
2. **API Status**: http://localhost:34301/health
3. **Docker Logs**: `docker logs -f ace-mcp-server-dev`

## 🚀 Готово!

После настройки ACE MCP будет:
- ✅ Генерировать траектории разработки
- ✅ Анализировать ваш код
- ✅ Накапливать знания в Playbook
- ✅ Предлагать улучшения на основе опыта

Теперь Cursor AI будет использовать самосовершенствующийся контекст для более качественной помощи в разработке! 🎉
