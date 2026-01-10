export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  filePath?: string;
  maxFileSize?: number;
  maxFiles?: number;
}

class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private subscribers: Map<string, (entry: LogEntry) => void> = new Map();

  constructor(config: LoggerConfig = { level: LogLevel.INFO, enableConsole: true, enableFile: false }) {
    this.config = config;
  }

  private formatLogEntry(entry: LogEntry): string {
    const dataStr = entry.data ? ` | Data: ${JSON.stringify(entry.data)}` : '';
    const userStr = entry.userId ? ` | User: ${entry.userId}` : '';
    const sessionStr = entry.sessionId ? ` | Session: ${entry.sessionId}` : '';
    return `[${entry.timestamp}] [${entry.level}] [${entry.module}]${userStr}${sessionStr} | ${entry.message}${dataStr}`;
  }

  private log(entry: LogEntry): void {
    if (this.shouldLog(entry.level)) {
      const formatted = this.formatLogEntry(entry);
      
      if (this.config.enableConsole) {
        const consoleMethod = this.getConsoleMethod(entry.level);
        consoleMethod(formatted);
      }

      this.logs.push(entry);
      
      this.subscribers.forEach((callback) => {
        try {
          callback(entry);
        } catch (error) {
          console.error('Error in log subscriber:', error);
        }
      });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    return levels.indexOf(level) >= levels.indexOf(this.config.level);
  }

  private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        return console.error;
      default:
        return console.log;
    }
  }

  private createLogEntry(level: LogLevel, module: string, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data
    };
  }

  debug(module: string, message: string, data?: any): void {
    this.log(this.createLogEntry(LogLevel.DEBUG, module, message, data));
  }

  info(module: string, message: string, data?: any): void {
    this.log(this.createLogEntry(LogLevel.INFO, module, message, data));
  }

  warn(module: string, message: string, data?: any): void {
    this.log(this.createLogEntry(LogLevel.WARN, module, message, data));
  }

  error(module: string, message: string, data?: any): void {
    this.log(this.createLogEntry(LogLevel.ERROR, module, message, data));
  }

  fatal(module: string, message: string, data?: any): void {
    this.log(this.createLogEntry(LogLevel.FATAL, module, message, data));
  }

  withContext(userId?: string, sessionId?: string, requestId?: string): ContextLogger {
    return new ContextLogger(this, userId, sessionId, requestId);
  }

  subscribe(id: string, callback: (entry: LogEntry) => void): () => void {
    this.subscribers.set(id, callback);
    return () => this.subscribers.delete(id);
  }

  getLogs(filter?: { level?: LogLevel; module?: string; startDate?: Date; endDate?: Date }): LogEntry[] {
    let filtered = this.logs;
    
    if (filter) {
      if (filter.level) {
        filtered = filtered.filter(log => log.level === filter.level);
      }
      if (filter.module) {
        filtered = filtered.filter(log => log.module === filter.module);
      }
      if (filter.startDate) {
        filtered = filtered.filter(log => new Date(log.timestamp) >= filter.startDate!);
      }
      if (filter.endDate) {
        filtered = filtered.filter(log => new Date(log.timestamp) <= filter.endDate!);
      }
    }
    
    return filtered;
  }

  clearLogs(): void {
    this.logs = [];
  }

  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

class ContextLogger {
  private logger: Logger;
  private userId?: string;
  private sessionId?: string;
  private requestId?: string;

  constructor(logger: Logger, userId?: string, sessionId?: string, requestId?: string) {
    this.logger = logger;
    this.userId = userId;
    this.sessionId = sessionId;
    this.requestId = requestId;
  }

  private addContext(entry: LogEntry): LogEntry {
    return {
      ...entry,
      userId: this.userId,
      sessionId: this.sessionId,
      requestId: this.requestId
    };
  }

  debug(module: string, message: string, data?: any): void {
    const entry = this.logger['createLogEntry'](LogLevel.DEBUG, module, message, data);
    this.logger['log'](this.addContext(entry));
  }

  info(module: string, message: string, data?: any): void {
    const entry = this.logger['createLogEntry'](LogLevel.INFO, module, message, data);
    this.logger['log'](this.addContext(entry));
  }

  warn(module: string, message: string, data?: any): void {
    const entry = this.logger['createLogEntry'](LogLevel.WARN, module, message, data);
    this.logger['log'](this.addContext(entry));
  }

  error(module: string, message: string, data?: any): void {
    const entry = this.logger['createLogEntry'](LogLevel.ERROR, module, message, data);
    this.logger['log'](this.addContext(entry));
  }

  fatal(module: string, message: string, data?: any): void {
    const entry = this.logger['createLogEntry'](LogLevel.FATAL, module, message, data);
    this.logger['log'](this.addContext(entry));
  }
}

export const logger = new Logger({ level: LogLevel.INFO, enableConsole: true, enableFile: false });
export default Logger;
