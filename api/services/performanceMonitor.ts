export interface RequestMetrics {
  method: string
  path: string
  statusCode: number
  duration: number
  timestamp: Date
  memoryUsage?: NodeJS.MemoryUsage
}

export interface DatabaseMetrics {
  query: string
  duration: number
  timestamp: Date
  success: boolean
  error?: string
}

export interface SystemMetrics {
  timestamp: Date
  cpuUsage: NodeJS.CpuUsage
  memoryUsage: NodeJS.MemoryUsage
  eventLoopDelay: number
}

export interface PerformanceStats {
  requests: {
    total: number
    averageDuration: number
    byPath: Record<string, { count: number; avgDuration: number; maxDuration: number }>
    byStatus: Record<number, number>
  }
  database: {
    totalQueries: number
    averageDuration: number
    successRate: number
    slowQueries: number
  }
  system: {
    averageCpuUsage: number
    averageMemoryUsage: number
    averageEventLoopDelay: number
  }
}

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy'

export class PerformanceMonitor {
  private requestMetrics: RequestMetrics[] = []
  private databaseMetrics: DatabaseMetrics[] = []
  private systemMetrics: SystemMetrics[] = []
  private maxMetrics: number = 1000
  private slowRequestThreshold: number = 5000 // 5 seconds
  private slowQueryThreshold: number = 1000 // 1 second

  /**
   * Record request metrics
   */
  recordRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number
  ): void {
    const metrics: RequestMetrics = {
      method,
      path,
      statusCode,
      duration,
      timestamp: new Date(),
      memoryUsage: process.memoryUsage()
    }

    this.requestMetrics.push(metrics)

    // Keep only maxMetrics entries
    if (this.requestMetrics.length > this.maxMetrics) {
      this.requestMetrics.shift()
    }

    // Alert on slow requests
    if (duration > this.slowRequestThreshold) {
      console.warn(`Slow request detected: ${method} ${path} took ${duration}ms`)
    }
  }

  /**
   * Record database query metrics
   */
  recordDatabaseQuery(
    query: string,
    duration: number,
    success: boolean,
    error?: string
  ): void {
    const metrics: DatabaseMetrics = {
      query: query.substring(0, 200), // Truncate long queries
      duration,
      timestamp: new Date(),
      success,
      error
    }

    this.databaseMetrics.push(metrics)

    // Keep only maxMetrics entries
    if (this.databaseMetrics.length > this.maxMetrics) {
      this.databaseMetrics.shift()
    }

    // Alert on slow queries
    if (duration > this.slowQueryThreshold) {
      console.warn(`Slow query detected: took ${duration}ms`)
    }
  }

  /**
   * Record system metrics
   */
  recordSystemMetrics(): void {
    const cpuUsage = process.cpuUsage()
    const memoryUsage = process.memoryUsage()
    const eventLoopDelay = this.measureEventLoopDelay()

    const metrics: SystemMetrics = {
      timestamp: new Date(),
      cpuUsage,
      memoryUsage,
      eventLoopDelay
    }

    this.systemMetrics.push(metrics)

    // Keep only maxMetrics entries
    if (this.systemMetrics.length > this.maxMetrics) {
      this.systemMetrics.shift()
    }
  }

  /**
   * Get performance statistics
   */
  getStats(): PerformanceStats {
    // Request statistics
    const requestStats = {
      total: this.requestMetrics.length,
      averageDuration: this.requestMetrics.length > 0
        ? this.requestMetrics.reduce((sum, m) => sum + m.duration, 0) / this.requestMetrics.length
        : 0,
      byPath: this.groupByPath(),
      byStatus: this.groupByStatus()
    }

    // Database statistics
    const dbStats = {
      totalQueries: this.databaseMetrics.length,
      averageDuration: this.databaseMetrics.length > 0
        ? this.databaseMetrics.reduce((sum, m) => sum + m.duration, 0) / this.databaseMetrics.length
        : 0,
      successRate: this.databaseMetrics.length > 0
        ? this.databaseMetrics.filter(m => m.success).length / this.databaseMetrics.length
        : 0,
      slowQueries: this.databaseMetrics.filter(m => m.duration > this.slowQueryThreshold).length
    }

    // System statistics
    const systemStats = {
      averageCpuUsage: this.calculateAverageCpuUsage(),
      averageMemoryUsage: this.calculateAverageMemoryUsage(),
      averageEventLoopDelay: this.calculateAverageEventLoopDelay()
    }

    return {
      requests: requestStats,
      database: dbStats,
      system: systemStats
    }
  }

  /**
   * Get recent request metrics
   */
  getRecentRequests(limit: number = 100): RequestMetrics[] {
    return this.requestMetrics.slice(-limit)
  }

  /**
   * Get recent database metrics
   */
  getRecentDatabaseMetrics(limit: number = 100): DatabaseMetrics[] {
    return this.databaseMetrics.slice(-limit)
  }

  /**
   * Get recent system metrics
   */
  getRecentSystemMetrics(limit: number = 100): SystemMetrics[] {
    return this.systemMetrics.slice(-limit)
  }

  /**
   * Get slow requests
   */
  getSlowRequests(threshold: number = this.slowRequestThreshold): RequestMetrics[] {
    return this.requestMetrics.filter(m => m.duration > threshold)
  }

  /**
   * Get slow queries
   */
  getSlowQueries(threshold: number = this.slowQueryThreshold): DatabaseMetrics[] {
    return this.databaseMetrics.filter(m => m.duration > threshold)
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.requestMetrics = []
    this.databaseMetrics = []
    this.systemMetrics = []
  }

  /**
   * Group requests by path
   */
  private groupByPath(): Record<string, { count: number; avgDuration: number; maxDuration: number }> {
    const groups: Record<string, RequestMetrics[]> = {}

    for (const metric of this.requestMetrics) {
      if (!groups[metric.path]) {
        groups[metric.path] = []
      }
      groups[metric.path].push(metric)
    }

    const result: Record<string, { count: number; avgDuration: number; maxDuration: number }> = {}

    for (const [path, metrics] of Object.entries(groups)) {
      const durations = metrics.map(m => m.duration)
      result[path] = {
        count: metrics.length,
        avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
        maxDuration: Math.max(...durations)
      }
    }

    return result
  }

  /**
   * Group requests by status code
   */
  private groupByStatus(): Record<number, number> {
    const groups: Record<number, number> = {}

    for (const metric of this.requestMetrics) {
      groups[metric.statusCode] = (groups[metric.statusCode] || 0) + 1
    }

    return groups
  }

  /**
   * Calculate average CPU usage
   */
  private calculateAverageCpuUsage(): number {
    if (this.systemMetrics.length === 0) {
      return 0
    }

    const totalCpu = this.systemMetrics.reduce((sum, m) => {
      const user = m.cpuUsage.user
      const system = m.cpuUsage.system
      return sum + (user + system)
    }, 0)

    return totalCpu / this.systemMetrics.length / 1000000 // Convert to percentage
  }

  /**
   * Calculate average memory usage in MB
   */
  private calculateAverageMemoryUsage(): number {
    if (this.systemMetrics.length === 0) {
      return 0
    }

    const totalMemory = this.systemMetrics.reduce((sum, m) => {
      return sum + m.memoryUsage.heapUsed
    }, 0)

    return (totalMemory / this.systemMetrics.length) / 1024 / 1024 // Convert to MB
  }

  /**
   * Calculate average event loop delay in ms
   */
  private calculateAverageEventLoopDelay(): number {
    if (this.systemMetrics.length === 0) {
      return 0
    }

    const totalDelay = this.systemMetrics.reduce((sum, m) => sum + m.eventLoopDelay, 0)
    return totalDelay / this.systemMetrics.length
  }

  /**
   * Measure event loop delay
   */
  private measureEventLoopDelay(): number {
    const start = process.hrtime.bigint()
    setImmediate(() => {
      const end = process.hrtime.bigint()
      const delay = Number(end - start) / 1000000 // Convert to ms
    })
    return 0 // Placeholder - actual delay measured in callback
  }

  /**
   * Create middleware for Express
   */
  createMiddleware() {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now()

      res.on('finish', () => {
        const duration = Date.now() - startTime
        this.recordRequest(
          req.method,
          req.path,
          res.statusCode,
          duration
        )
      })

      next()
    }
  }

  /**
   * Start periodic system metrics collection
   */
  startPeriodicCollection(interval: number = 60000): void {
    setInterval(() => {
      this.recordSystemMetrics()
    }, interval)
  }

  /**
   * Get health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy'
    issues: string[]
  } {
    const stats = this.getStats()
    const issues: string[] = []
    let status = 'healthy'

    // Check request performance
    if (stats.requests.averageDuration > 1000) {
      status = 'degraded'
      issues.push(`High average request duration: ${stats.requests.averageDuration}ms`)
    }

    if (stats.requests.averageDuration > 5000) {
      status = 'unhealthy'
      issues.push(`Very high average request duration: ${stats.requests.averageDuration}ms`)
    }

    // Check database performance
    if (stats.database.averageDuration > 500) {
      status = 'degraded'
      issues.push(`High average query duration: ${stats.database.averageDuration}ms`)
    }

    if (stats.database.averageDuration > 2000) {
      status = 'unhealthy'
      issues.push(`Very high average query duration: ${stats.database.averageDuration}ms`)
    }

    // Check system resources
    if (stats.system.averageMemoryUsage > 512) {
      status = 'degraded'
      issues.push(`High memory usage: ${stats.system.averageMemoryUsage.toFixed(2)}MB`)
    }

    if (stats.system.averageMemoryUsage > 1024) {
      status = 'unhealthy'
      issues.push(`Very high memory usage: ${stats.system.averageMemoryUsage.toFixed(2)}MB`)
    }

    if (stats.system.averageEventLoopDelay > 100) {
      status = 'degraded'
      issues.push(`High event loop delay: ${stats.system.averageEventLoopDelay.toFixed(2)}ms`)
    }

    if (stats.system.averageEventLoopDelay > 500) {
      status = 'unhealthy'
      issues.push(`Very high event loop delay: ${stats.system.averageEventLoopDelay.toFixed(2)}ms`)
    }

    return { status: status as HealthStatus, issues }
  }
}

export default new PerformanceMonitor()
