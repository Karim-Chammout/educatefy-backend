import pino from 'pino';

import config from '../config.js';

const isDevelopment = config.APP_ENV === 'development';

const logger = pino({
  level: config.LOG_LEVEL,
  base: isDevelopment
    ? undefined
    : {
        service: 'backend',
        env: config.APP_ENV,
      },
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  timestamp: isDevelopment ? false : pino.stdTimeFunctions.isoTime,
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },
});

export function createChildLogger(bindings: Record<string, unknown>) {
  return logger.child(bindings);
}

export default logger;
