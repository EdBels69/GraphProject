# Документация механизма автоматического повторения запросов (Retry Mechanism)

**Дата:** 2026-01-06
**Статус:** ✅ Реализовано

---

## Обзор

Механизм автоматического повторения запросов разработан для обработки аномальных завершений работы системы. Он обеспечивает надежность и устойчивость приложения к сбоям сети, внезапным перезагрузкам и изменениям в окружении.

---

## Основные требования

### ✅ 1. Автоматическое повторение при "abnormally stopped"

Система:
- **Фиксирует время остановки** при обнаружении ошибки
- **Выжидает ровно 15 секунд** между попытками
- **Автоматически инициирует повторный запрос**

### ✅ 2. Циклическая логика до успешного завершения

Повторения выполняются циклически до тех пор, пока:
- Задача будет **успешно завершена**
- Не будет достигнуто **максимальное количество попыток** (20 по умолчанию)

### ✅ 3. Дополнительные требования

- **Вести лог всех автоматических перезапусков** с timestamp
- **Отправлять уведомление** при достижении максимального количества попыток
- **Сохранять контекст задачи** между попытками (localStorage)

### ✅ 4. Устойчивость к внешним факторам

Система устойчива к:
- Внезапным перезагрузкам системы (сохранение состояния в localStorage)
- Сбоям сети (автоматические повторные попытки)
- Изменениям в окружении (проверка при каждой попытке)

### ✅ 5. Интерфейс пользователя

Интерфейс отображает:
- **Текущий статус повторных попыток** (выполняется/готово)
- **Количество выполненных попыток** (текущая/максимум)
- **Время следующего автоматического запроса** (обратный отсчет)

---

## Архитектура

### 1. RetryHandler (Утилита)

**Файл:** `src/utils/retryHandler.ts`

**Основной класс:** `RetryHandler`

**Методы:**

```typescript
class RetryHandler {
  // Выполняет задачу с автоматическими повторными попытками
  async execute<T>(task: () => Promise<T>, taskId: string): Promise<T>
  
  // Отменяет текущее повторение
  abort(): void
  
  // Сбрасывает состояние
  resetState(): void
  
  // Возобновляет повторение (если оно было на паузе)
  async resume(): Promise<void>
  
  // Получает текущее состояние
  getState(): RetryState
  
  // Получает историю логов
  getLogs(): RetryLogEntry[]
  
  // Очищает логи
  clearLogs(): void
  
  // Получает оставшиеся попытки
  getRemainingRetries(): number
  
  // Получает время до следующего повторения
  getTimeUntilNextRetry(): number | null
}
```

**Интерфейсы:**

```typescript
interface RetryConfig {
  maxRetries: number           // Максимум попыток (по умолчанию: 20)
  retryDelay: number           // Задержка между попытками в ms (по умолчанию: 15000)
  onRetry?: (attempt: number, error: Error) => void  // Callback при каждой попытке
  onMaxRetriesReached?: () => void  // Callback при достижении максимума
  persistContext?: boolean    // Сохранять состояние между попытками (по умолчанию: true)
}

interface RetryState {
  isRetrying: boolean         // Выполняется ли повторение
  currentAttempt: number      // Текущая попытка
  totalRetries: number        // Всего повторений
  nextRetryTime: Date | null  // Время следующего повторения
  lastError: Error | null   // Последняя ошибка
  startTime: Date            // Время начала первой попытки
}

interface RetryLogEntry {
  timestamp: Date           // Время попытки
  attempt: number           // Номер попытки
  success: boolean          // Успех или провал
  error?: string            // Сообщение об ошибке
  duration: number          // Длительность попытки в ms
}
```

---

### 2. RetryStatus (Компонент UI)

**Файл:** `src/components/RetryStatus.tsx`

**Функционал:**

1. **Отображение статуса:**
   - Спиннер во время выполнения
   - Зеленый индикатор при успехе
   - Прогресс-бар (процент завершения)

2. **Информация о попытках:**
   - Текущая попытка / Максимум попыток
   - Общее количество попыток
   - Оставшиеся попытки
   - Время выполнения

3. **Таймер следующей попытки:**
   - Обратный отсчет до следующего автоматического запроса
   - Форматирование времени (секунды, минуты, часы)

4. **История попыток:**
   - Список последних 10 попыток
   - Timestamp для каждой попытки
   - Статус (успех/провал)
   - Длительность каждой попытки
   - Сообщение об ошибке (если есть)

5. **Управление:**
   - Кнопка отмены повторения
   - Кнопка очистки логов
   - Раскрытие/скрытие деталей

---

## Использование

### Базовое использование

```typescript
import { createRetryHandler } from '@/utils/retryHandler'

const handler = createRetryHandler({
  maxRetries: 20,
  retryDelay: 15000,
  onRetry: (attempt, error) => {
    console.log(`Попытка ${attempt} завершилась с ошибкой:`, error)
  },
  onMaxRetriesReached: () => {
    console.error('Достигнуто максимальное количество попыток!')
  }
})

try {
  const result = await handler.execute(
    async () => {
      // Ваша асинхронная операция
      await uploadArticles()
    },
    'upload-articles'  // Уникальный идентификатор задачи
  )
  console.log('Успех!', result)
} catch (error) {
  console.error('Все попытки не удались:', error)
}
```

### Использование с withRetry helper

```typescript
import { withRetry } from '@/utils/retryHandler'

try {
  const result = await withRetry(
    async () => {
      await fetchArticles()
    },
    {
      maxRetries: 10,
      retryDelay: 10000,
      onMaxRetriesReached: () => {
        toast.error('Не удалось загрузить данные после 10 попыток')
      }
    },
    'fetch-articles'  // Task ID
  )
  console.log('Успех!', result)
} catch (error) {
  console.error('Ошибка:', error)
}
```

### Интеграция с React компонентом

```tsx
import { useState } from 'react'
import { createRetryHandler, RetryHandler } from '@/utils/retryHandler'
import RetryStatus from '@/components/RetryStatus'

function MyComponent() {
  const [retryHandler, setRetryHandler] = useState<RetryHandler | null>(null)

  const handleSubmit = async () => {
    const handler = createRetryHandler({
      maxRetries: 20,
      retryDelay: 15000,
      onMaxRetriesReached: () => {
        toast.error('Достигнуто максимальное количество попыток')
      }
    })

    setRetryHandler(handler)

    try {
      await handler.execute(
        async () => {
          await myAsyncOperation()
        },
        'my-operation-id'
      )
      toast.success('Операция выполнена успешно!')
    } catch (error) {
      toast.error('Ошибка: ' + error.message)
    } finally {
      setRetryHandler(null)
    }
  }

  return (
    <div>
      <button onClick={handleSubmit}>Выполнить операцию</button>
      {retryHandler && (
        <RetryStatus
          retryHandler={retryHandler}
          showLogs={true}
          onClearLogs={() => handler.clearLogs()}
          onAbort={() => handler.abort()}
        />
      )}
    </div>
  )
}
```

---

## Реализованные примеры

### Пример 1: Загрузка статей (UploadArticlesPage)

**Файл:** `src/pages/UploadArticlesPage.tsx`

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    await withRetry(
      async () => {
        await simulateArticleUpload()
      },
      {
        maxRetries: 20,
        retryDelay: 15000,
        onRetry: (attempt, error) => {
          console.log(`Retry attempt ${attempt} after error:`, error)
        },
        onMaxRetriesReached: () => {
          toast.error('Не удалось загрузить статьи после 20 попыток')
          setShowNotification(true)
        }
      },
      'upload-articles'
    )

    setLoading(false)
    toast.success('Статьи успешно загружены!')
  } catch (error) {
    setLoading(false)
    toast.error('Ошибка при загрузке статей: ' + error.message)
  }
}
```

---

## Особенности

### 1. Сохранение состояния (Persistence)

- **LocalStorage:** Состояние сохраняется между перезагрузками страницы
- **Автоматическое восстановление:** При обновлении страницы повторение возобновляется
- **Идентификатор задачи:** Уникальный ID для каждой задачи

### 2. Логирование (Logging)

- **Полная история:** Все попытки сохраняются с timestamp
- **Детальная информация:** Успех, ошибка, длительность
- **Очистка:** Возможность очистки логов пользователем

### 3. Устойчивость (Resilience)

- **AbortController:** Возможность отмены повторения пользователем
- **Сетевые сбои:** Автоматические повторные попытки
- **Контроль состояния:** Проверка состояния перед каждой попыткой

### 4. UI Feedback

- **Toast уведомления:** Информирование пользователя о событиях
- **Модальные окна:** Предупреждения при достижении максимума
- **Спиннеры:** Визуализация процесса выполнения
- **Прогресс:** Отображение процента завершения

---

## Конфигурация

### Параметры RetryConfig

| Параметр | Тип | По умолчанию | Описание |
|-----------|------|----------------|------------|
| maxRetries | number | 20 | Максимальное количество попыток |
| retryDelay | number | 15000 | Задержка между попытками в миллисекундах |
| onRetry | function | undefined | Callback при каждой попытке |
| onMaxRetriesReached | function | undefined | Callback при достижении максимума |
| persistContext | boolean | true | Сохранять состояние в localStorage |

### Рекомендуемые значения

**Критические операции:**
```typescript
{
  maxRetries: 20,
  retryDelay: 15000  // 15 секунд
}
```

**Обычные операции:**
```typescript
{
  maxRetries: 5,
  retryDelay: 5000  // 5 секунд
}
```

**Быстрые операции:**
```typescript
{
  maxRetries: 3,
  retryDelay: 1000  // 1 секунда
}
```

---

## Тестирование

### Unit тесты

```typescript
import { RetryHandler } from '@/utils/retryHandler'

describe('RetryHandler', () => {
  it('should retry on failure', async () => {
    const handler = new RetryHandler({ maxRetries: 3, retryDelay: 100 })
    let attempts = 0

    await expect(async () => {
      await handler.execute(async () => {
        attempts++
        throw new Error('Test error')
      }, 'test-id')
    }).rejects.toThrow()

    expect(attempts).toBe(3)
  })

  it('should succeed on first try', async () => {
    const handler = new RetryHandler({ maxRetries: 3, retryDelay: 100 })
    
    const result = await handler.execute(async () => {
      return 'success'
    }, 'test-id')

    expect(result).toBe('success')
  })

  it('should call onMaxRetriesReached', async () => {
    let callbackCalled = false
    const handler = new RetryHandler({ 
      maxRetries: 2, 
      retryDelay: 100,
      onMaxRetriesReached: () => { callbackCalled = true }
    })

    await expect(async () => {
      await handler.execute(async () => {
        throw new Error('Test error')
      }, 'test-id')
    }).rejects.toThrow()

    expect(callbackCalled).toBe(true)
  })
})
```

---

## Устранение проблем

### Проблема: Retry не выполняется после перезагрузки страницы

**Причина:** Состояние не сохранено в localStorage

**Решение:**
```typescript
const handler = createRetryHandler({
  persistContext: true  // Включено по умолчанию
})
```

### Проблема: Задержка не соответствует 15 секундам

**Причина:** Неверное значение retryDelay

**Решение:**
```typescript
const handler = createRetryHandler({
  retryDelay: 15000  // 15000 ms = 15 секунд
})
```

### Проблема: Логи не отображаются в UI

**Причина:** Компонент RetryStatus не подключен

**Решение:**
```tsx
<RetryStatus
  retryHandler={retryHandler}
  showLogs={true}
  onClearLogs={() => handler.clearLogs()}
  onAbort={() => handler.abort()}
/>
```

---

## Будущие улучшения

### Краткосрочные:
- [ ] Добавление экспоненциального backoff для задержки между попытками
- [ ] Поддержка нескольких параллельных retry механизмов
- [ ] Анимация прогресс-бара в UI

### Среднесрочные:
- [ ] Интеграция с Error Boundaries
- [ ] Отправка логов на сервер для анализа
- [ ] Статистика успешности операций по типам

### Долгосрочные:
- [ ] Адаптивная настройка параметров retry на основе истории
- [ ] Предсказание вероятности успеха с помощью ML
- [ ] Распределенная обработка retry для масштабирования

---

## Заключение

### Статус: ✅ Полностью реализовано

Механизм автоматического повторения запросов полностью соответствует всем требованиям:

1. ✅ **Автоматическое повторение при "abnormally stopped"** - с фиксацией времени и 15-секундной задержкой
2. ✅ **Циклическая логика** - до успешного завершения или достижения максимума (20 попыток)
3. ✅ **Дополнительные требования** - логирование, уведомления, сохранение контекста
4. ✅ **Устойчивость** - к перезагрузкам, сбоям сети, изменениям окружения
5. ✅ **Интерфейс пользователя** - статус, попытки, время следующего запроса

**Система обеспечивает надежную обработку аномальных завершений работы и предоставляет пользователю полную информацию о процессе выполнения задач.**

---

**Документацию подготовил:** SOLO Builder
**Дата:** 2026-01-06
**Версия:** 1.0.0