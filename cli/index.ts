import readline from 'readline'
import logger from '../src/core/Logger'
import errorHandler from '../src/core/ErrorHandler'
import sessionManager from '../src/core/SessionManager'
import databaseManager from '../src/core/Database'

interface Command {
  name: string
  description: string
  handler: (args: string[]) => Promise<void>
}

class CLI {
  private commands: Map<string, Command> = new Map()
  private rl: readline.Interface
  private running = false

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    this.registerCommands()
  }

  private registerCommands(): void {
    this.commands.set('help', {
      name: 'help',
      description: 'Показать список команд',
      handler: async () => this.showHelp()
    })

    this.commands.set('status', {
      name: 'status',
      description: 'Показать статус системы',
      handler: async () => this.showStatus()
    })

    this.commands.set('metrics', {
      name: 'metrics',
      description: 'Показать метрики системы',
      handler: async () => this.showMetrics()
    })

    this.commands.set('logs', {
      name: 'logs',
      description: 'Показать логи [level] [module] [count]',
      handler: async (args) => this.showLogs(args)
    })

    this.commands.set('errors', {
      name: 'errors',
      description: 'Показать ошибки',
      handler: async () => this.showErrors()
    })

    this.commands.set('sessions', {
      name: 'sessions',
      description: 'Показать активные сессии',
      handler: async () => this.showSessions()
    })

    this.commands.set('db:stats', {
      name: 'db:stats',
      description: 'Показать статистику базы данных',
      handler: async () => this.showDatabaseStats()
    })

    this.commands.set('db:init', {
      name: 'db:init',
      description: 'Инициализировать базу данных',
      handler: async () => this.initDatabase()
    })

    this.commands.set('clear', {
      name: 'clear',
      description: 'Очистить экран',
      handler: async () => {
        console.clear()
        this.showWelcome()
      }
    })

    this.commands.set('exit', {
      name: 'exit',
      description: 'Выйти из консоли',
      handler: async () => this.exit()
    })

    this.commands.set('quit', {
      name: 'quit',
      description: 'Выйти из консоли',
      handler: async () => this.exit()
    })
  }

  private async showHelp(): Promise<void> {
    console.log('\n📋 Доступные команды:\n')
    
    const commands = Array.from(this.commands.values())
    const maxLength = Math.max(...commands.map(c => c.name.length))

    for (const command of commands) {
      console.log(`  ${command.name.padEnd(maxLength + 2)} - ${command.description}`)
    }
    console.log()
  }

  private async showStatus(): Promise<void> {
    console.log('\n📊 Статус системы:\n')
    console.log(`  ✅ Система логирования: активна`)
    console.log(`  ✅ Обработчик ошибок: активен`)
    console.log(`  ✅ Менеджер сессий: активен`)
    console.log(`  ✅ Менеджер базы данных: активен`)
    console.log(`  📈 Активных сессий: ${sessionManager.getActiveSessionCount()}`)
    console.log(`  👥 Уникальных пользователей: ${sessionManager.getUserCount()}`)
    console.log()
  }

  private async showMetrics(): Promise<void> {
    const metrics = errorHandler.getMetrics()
    const dbMetrics = databaseManager.getMetrics()
    const sessionMetrics = sessionManager.getSessionMetrics()

    console.log('\n📈 Метрики системы:\n')
    console.log('  Ошибки:')
    console.log(`    Всего: ${metrics.totalErrors}`)
    console.log(`    По типам: ${Object.fromEntries(metrics.errorsByType)}`)
    console.log(`    По кодам: ${Object.fromEntries(metrics.errorsByCode)}`)
    
    console.log('\n  База данных:')
    console.log(`    Статьи: ${dbMetrics.articles}`)
    console.log(`    Связи: ${dbMetrics.edges}`)
    console.log(`    Паттерны: ${dbMetrics.patterns}`)
    console.log(`    Пользователи: ${dbMetrics.users}`)
    
    console.log('\n  Сессии:')
    console.log(`    Всего: ${sessionMetrics.totalSessions}`)
    console.log(`    Пользователей: ${sessionMetrics.totalUsers}`)
    console.log(`    Среднее на пользователя: ${sessionMetrics.totalSessions > 0 ? (sessionMetrics.totalSessions / sessionMetrics.totalUsers).toFixed(2) : 0}`)
    console.log()
  }

  private async showLogs(args: string[]): Promise<void> {
    const level = args[0]?.toUpperCase()
    const module = args[1]
    const count = parseInt(args[2]) || 10

    console.log(`\n📝 Последние ${count} записей логов${level ? ` (${level})` : ''}${module ? ` [${module}]` : ''}:\n`)

    const filter: any = { limit: count }
    if (level && ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'].includes(level)) {
      filter.level = level
    }
    if (module) {
      filter.module = module
    }

    const logs = logger.getLogs(filter)

    if (logs.length === 0) {
      console.log('  Нет записей логов\n')
      return
    }

    for (const log of logs) {
      const timestamp = new Date(log.timestamp).toLocaleTimeString('ru-RU')
      const levelColor = this.getLevelColor(log.level)
      console.log(`  [${timestamp}] [${levelColor}${log.level}\x1b[0m] [${log.module}] ${log.message}`)
      if (log.data) {
        console.log(`    Data: ${JSON.stringify(log.data)}`)
      }
    }
    console.log()
  }

  private async showErrors(): Promise<void> {
    const metrics = errorHandler.getMetrics()

    console.log('\n❌ Ошибки системы:\n')
    console.log(`  Всего ошибок: ${metrics.totalErrors}`)
    console.log('  По типам:')
    
    for (const [type, count] of metrics.errorsByType.entries()) {
      console.log(`    ${type}: ${count}`)
    }

    console.log('\n  Последние ошибки:')
    if (metrics.recentErrors.length === 0) {
      console.log('    Нет ошибок')
    } else {
      for (const error of metrics.recentErrors.slice(0, 10)) {
        console.log(`    [${error.type}] ${error.code}: ${error.message}`)
        console.log(`      Время: ${new Date(error.timestamp).toLocaleString('ru-RU')}`)
      }
    }
    console.log()
  }

  private async showSessions(): Promise<void> {
    const metrics = sessionManager.getSessionMetrics()

    console.log('\n👥 Активные сессии:\n')
    console.log(`  Всего сессий: ${metrics.totalSessions}`)
    console.log(`  Уникальных пользователей: ${metrics.totalUsers}`)
    console.log(`  Сессий на пользователя: ${metrics.sessionsPerUser.join(', ') || '0'}`)
    console.log()
  }

  private async showDatabaseStats(): Promise<void> {
    const metrics = databaseManager.getMetrics()

    console.log('\n💾 Статистика базы данных:\n')
    console.log(`  Статьи: ${metrics.articles}`)
    console.log(`  Связи (edges): ${metrics.edges}`)
    console.log(`  Паттерны: ${metrics.patterns}`)
    console.log(`  Пользователи: ${metrics.users}`)
    console.log()
  }

  private async initDatabase(): Promise<void> {
    console.log('\n🔧 Инициализация базы данных...\n')

    try {
      await databaseManager.initialize()
      console.log('✅ База данных успешно инициализирована\n')
    } catch (error) {
      console.log('❌ Ошибка при инициализации базы данных\n')
      logger.error('CLI', 'Database initialization failed', { error })
    }
  }

  private async exit(): Promise<void> {
    console.log('\n👋 Завершение работы...\n')
    
    try {
      await databaseManager.close()
      await sessionManager.shutdown()
      console.log('✅ Ресурсы освобождены\n')
    } catch (error) {
      logger.error('CLI', 'Error during shutdown', { error })
    }

    this.running = false
    this.rl.close()
    process.exit(0)
  }

  private showWelcome(): void {
    console.log(`
╔════════════════════════════════════════════════════════╗
║         Graph Analyser - Консоль управления                   ║
║              v1.0.0 | Ядро системы                       ║
╚════════════════════════════════════════════════════════╝

Для получения справки введите: help
Для выхода введите: exit или quit
`)
  }

  private getLevelColor(level: string): string {
    const colors = {
      DEBUG: '\x1b[36m',
      INFO: '\x1b[32m',
      WARN: '\x1b[33m',
      ERROR: '\x1b[31m',
      FATAL: '\x1b[35m'
    }
    return colors[level as keyof typeof colors] || '\x1b[0m'
  }

  private async processCommand(input: string): Promise<void> {
    const trimmed = input.trim()
    if (!trimmed) return

    const [command, ...args] = trimmed.split(' ')
    const handler = this.commands.get(command.toLowerCase())

    if (handler) {
      try {
        await handler.handler(args)
      } catch (error) {
        console.log(`\n❌ Ошибка выполнения команды: ${error instanceof Error ? error.message : error}\n`)
        logger.error('CLI', `Command execution failed: ${command}`, { error })
      }
    } else {
      console.log(`\n❌ Неизвестная команда: ${command}`)
      console.log('Введите "help" для списка команд\n')
    }
  }

  async start(): Promise<void> {
    console.clear()
    this.showWelcome()
    this.running = true

    while (this.running) {
      const input = await new Promise<string>((resolve) => {
        this.rl.question('🔹 > ', resolve)
      })

      await this.processCommand(input)
    }
  }
}

async function main() {
  try {
    logger.info('CLI', 'Starting CLI interface')
    await databaseManager.initialize()
    
    const cli = new CLI()
    await cli.start()
  } catch (error) {
    console.log('❌ Критическая ошибка при запуске CLI:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export default CLI
