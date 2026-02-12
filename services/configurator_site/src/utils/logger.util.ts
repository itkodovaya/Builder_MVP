/**
 * Logger Utility
 * 
 * Simple logger utility for the service
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private formatMessage(level: LogLevel, message: string, ...args: unknown[]): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return `${prefix} ${message}${args.length > 0 ? ' ' + JSON.stringify(args) : ''}`;
  }

  debug(message: string, ...args: unknown[]): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage('debug', message, ...args));
    }
  }

  info(message: string, ...args: unknown[]): void {
    console.log(this.formatMessage('info', message, ...args));
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(this.formatMessage('warn', message, ...args));
  }

  error(message: string, error?: Error, ...args: unknown[]): void {
    const errorInfo = error ? `\n${error.stack}` : '';
    console.error(this.formatMessage('error', message, ...args) + errorInfo);
  }
}

export const logger = new Logger();

