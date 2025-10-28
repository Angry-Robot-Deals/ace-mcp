type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private level: LogLevel = 'info';

  constructor() {
    const envLevel = process.env.ACE_LOG_LEVEL?.toLowerCase() as LogLevel;
    if (envLevel && ['debug', 'info', 'warn', 'error'].includes(envLevel)) {
      this.level = envLevel;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private format(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  debug(message: string, meta?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(this.format('debug', message, meta));
    }
  }

  info(message: string, meta?: any): void {
    if (this.shouldLog('info')) {
      console.info(this.format('info', message, meta));
    }
  }

  warn(message: string, meta?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.format('warn', message, meta));
    }
  }

  error(message: string, meta?: any): void {
    if (this.shouldLog('error')) {
      console.error(this.format('error', message, meta));
    }
  }
}

export const logger = new Logger();
