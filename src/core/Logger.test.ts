import Logger, { LogLevel } from './Logger';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger({ level: LogLevel.DEBUG, enableConsole: false, enableFile: false });
  });

  describe('log levels', () => {
    it('should log debug messages', () => {
      const callback = jest.fn();
      logger.subscribe('test', callback);

      logger.debug('TestModule', 'Test message');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.DEBUG,
          module: 'TestModule',
          message: 'Test message'
        })
      );
    });

    it('should log info messages', () => {
      const callback = jest.fn();
      logger.subscribe('test', callback);

      logger.info('TestModule', 'Test message');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.INFO,
          module: 'TestModule',
          message: 'Test message'
        })
      );
    });

    it('should log warning messages', () => {
      const callback = jest.fn();
      logger.subscribe('test', callback);

      logger.warn('TestModule', 'Test message');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.WARN,
          module: 'TestModule',
          message: 'Test message'
        })
      );
    });

    it('should log error messages', () => {
      const callback = jest.fn();
      logger.subscribe('test', callback);

      logger.error('TestModule', 'Test message');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.ERROR,
          module: 'TestModule',
          message: 'Test message'
        })
      );
    });

    it('should log fatal messages', () => {
      const callback = jest.fn();
      logger.subscribe('test', callback);

      logger.fatal('TestModule', 'Test message');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.FATAL,
          module: 'TestModule',
          message: 'Test message'
        })
      );
    });
  });

  describe('log filtering', () => {
    it('should respect log level configuration', () => {
      const infoLogger = new Logger({ level: LogLevel.INFO, enableConsole: false, enableFile: false });
      const callback = jest.fn();
      infoLogger.subscribe('test', callback);

      infoLogger.debug('TestModule', 'Debug message');
      infoLogger.info('TestModule', 'Info message');
      infoLogger.warn('TestModule', 'Warn message');

      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should filter logs by level when retrieving', () => {
      logger.info('TestModule', 'Info message');
      logger.error('TestModule', 'Error message');
      logger.warn('TestModule', 'Warn message');

      const errorLogs = logger.getLogs({ level: LogLevel.ERROR });
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0].level).toBe(LogLevel.ERROR);
    });

    it('should filter logs by module when retrieving', () => {
      logger.info('ModuleA', 'Message A');
      logger.info('ModuleB', 'Message B');
      logger.info('ModuleA', 'Message A2');

      const moduleLogs = logger.getLogs({ module: 'ModuleA' });
      expect(moduleLogs).toHaveLength(2);
      expect(moduleLogs.every(log => log.module === 'ModuleA')).toBe(true);
    });
  });

  describe('log data', () => {
    it('should include data in log entry', () => {
      const callback = jest.fn();
      logger.subscribe('test', callback);

      const testData = { key1: 'value1', key2: 123 };
      logger.info('TestModule', 'Test message', testData);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          data: testData
        })
      );
    });
  });

  describe('subscriptions', () => {
    it('should allow multiple subscriptions', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      logger.subscribe('sub1', callback1);
      logger.subscribe('sub2', callback2);

      logger.info('TestModule', 'Test message');

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should allow unsubscribing', () => {
      const callback = jest.fn();
      const unsubscribe = logger.subscribe('test', callback);

      logger.info('TestModule', 'Message 1');
      unsubscribe();
      logger.info('TestModule', 'Message 2');

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should handle errors in callbacks gracefully', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      const successCallback = jest.fn();

      logger.subscribe('error', errorCallback);
      logger.subscribe('success', successCallback);

      expect(() => logger.info('TestModule', 'Test message')).not.toThrow();
      expect(successCallback).toHaveBeenCalled();
    });
  });

  describe('clear logs', () => {
    it('should clear all logs', () => {
      logger.info('TestModule', 'Message 1');
      logger.info('TestModule', 'Message 2');

      expect(logger.getLogs()).toHaveLength(2);

      logger.clearLogs();

      expect(logger.getLogs()).toHaveLength(0);
    });
  });

  describe('context logger', () => {
    it('should add context to log entries', () => {
      const callback = jest.fn();
      logger.subscribe('test', callback);

      const contextLogger = logger.withContext('user123', 'session456', 'req789');
      contextLogger.info('TestModule', 'Test message');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          sessionId: 'session456',
          requestId: 'req789'
        })
      );
    });
  });

  describe('configuration', () => {
    it('should allow updating configuration', () => {
      logger.setConfig({ level: LogLevel.WARN });

      const callback = jest.fn();
      logger.subscribe('test', callback);

      logger.info('TestModule', 'Info message');
      logger.warn('TestModule', 'Warn message');

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
