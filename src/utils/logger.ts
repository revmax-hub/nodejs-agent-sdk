import { LogLevel, LogHandler, LoggingOptions } from '../types';

/**
 * Default log levels priority
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Default log handler function
 */
const defaultLogHandler: LogHandler = (level, message, data) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  switch (level) {
    case 'error':
      console.error(logMessage, data ? data : '');
      break;
    case 'warn':
      console.warn(logMessage, data ? data : '');
      break;
    case 'info':
      console.info(logMessage, data ? data : '');
      break;
    case 'debug':
    default:
      console.debug(logMessage, data ? data : '');
      break;
  }
};

/**
 * Logger class for SDK logging
 */
export class Logger {
  private readonly enabled: boolean;
  private readonly minLevel: LogLevel;
  private readonly handler: LogHandler;

  /**
   * Create a new logger instance
   * @param options - Logger configuration options
   */
  constructor(options?: LoggingOptions) {
    this.enabled = options?.enabled ?? false;
    this.minLevel = options?.level ?? 'info';
    this.handler = options?.handler ?? defaultLogHandler;
  }

  /**
   * Check if a log level should be output
   * @param level - Log level to check
   * @returns Whether the level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false;
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel];
  }

  /**
   * Log a message at the debug level
   * @param message - Log message
   * @param data - Optional data to log
   */
  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      this.handler('debug', message, data);
    }
  }

  /**
   * Log a message at the info level
   * @param message - Log message
   * @param data - Optional data to log
   */
  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      this.handler('info', message, data);
    }
  }

  /**
   * Log a message at the warn level
   * @param message - Log message
   * @param data - Optional data to log
   */
  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      this.handler('warn', message, data);
    }
  }

  /**
   * Log a message at the error level
   * @param message - Log message
   * @param data - Optional data to log
   */
  error(message: string, data?: any): void {
    if (this.shouldLog('error')) {
      this.handler('error', message, data);
    }
  }
}
