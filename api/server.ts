
import 'dotenv/config'
import { app, httpServer } from './app'
import { databaseManager } from './core/Database'
import { literatureAgent } from './services/literatureAgent'
import { logger } from './core/Logger'

const PORT = process.env.PORT || 3002

console.log('Server starting... (Force Restart)')
console.log('CWD:', process.cwd())
console.log('DATABASE_URL:', process.env.DATABASE_URL)

async function startServer() {
  try {
    // Initialize Database
    await databaseManager.initialize()

    // Initialize Agents
    await literatureAgent.initialize()

    const server = httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
      logger.info('Server', `Server started on port ${PORT}`)
    })

    const shutdown = () => {
      console.log('Stopping server...')
      server.close(() => {
        console.log('Server stopped')
        process.exit(0)
      })
    }

    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
