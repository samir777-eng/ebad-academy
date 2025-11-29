import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('logger', () => {
  let consoleLogSpy: any;
  let consoleInfoSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;
  let consoleDebugSpy: any;
  let originalEnv: string | undefined;

  beforeEach(() => {
    // Save original NODE_ENV
    originalEnv = process.env.NODE_ENV;
    
    // Spy on console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;
    
    // Restore console methods
    consoleLogSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleDebugSpy.mockRestore();
    
    // Clear module cache to reload logger with new NODE_ENV
    vi.resetModules();
  });

  describe('in development mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      vi.resetModules();
    });

    it('should log messages in development', async () => {
      const { logger } = await import('../logger');
      logger.log('test message');
      expect(consoleLogSpy).toHaveBeenCalledWith('test message');
    });

    it('should log info messages in development', async () => {
      const { logger } = await import('../logger');
      logger.info('info message');
      expect(consoleInfoSpy).toHaveBeenCalledWith('info message');
    });

    it('should log warnings in development', async () => {
      const { logger } = await import('../logger');
      logger.warn('warning message');
      expect(consoleWarnSpy).toHaveBeenCalledWith('warning message');
    });

    it('should log errors with details in development', async () => {
      const { logger } = await import('../logger');
      const error = new Error('test error');
      logger.error('error message', error);
      expect(consoleErrorSpy).toHaveBeenCalledWith('error message', error);
    });

    it('should log debug messages in development', async () => {
      const { logger } = await import('../logger');
      logger.debug('debug message');
      expect(consoleDebugSpy).toHaveBeenCalledWith('debug message');
    });
  });

  describe('in production mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      vi.resetModules();
    });

    it('should NOT log messages in production', async () => {
      const { logger } = await import('../logger');
      logger.log('test message');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should NOT log info messages in production', async () => {
      const { logger } = await import('../logger');
      logger.info('info message');
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    it('should NOT log warnings in production', async () => {
      const { logger } = await import('../logger');
      logger.warn('warning message');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should log sanitized errors in production', async () => {
      const { logger } = await import('../logger');
      const error = new Error('sensitive error details');
      logger.error('error message', error);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'An error occurred. Check application logs for details.'
      );
      expect(consoleErrorSpy).not.toHaveBeenCalledWith('error message', error);
    });

    it('should NOT log debug messages in production', async () => {
      const { logger } = await import('../logger');
      logger.debug('debug message');
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });
  });

  describe('in test mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
      vi.resetModules();
    });

    it('should NOT log messages in test mode', async () => {
      const { logger } = await import('../logger');
      logger.log('test message');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should log sanitized errors in test mode', async () => {
      const { logger } = await import('../logger');
      logger.error('error message');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'An error occurred. Check application logs for details.'
      );
    });
  });
});

