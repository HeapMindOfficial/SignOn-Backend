import pino, { type LoggerOptions } from 'pino';

import { env } from './env.js';

const baseOptions: LoggerOptions = {
  level: env.logLevel,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.password',
      '*.token',
      '*.accessToken',
      '*.refreshToken',
      '*.clientSecret',
    ],
    censor: '[REDACTED]',
  },
};

export const logger =
  env.nodeEnv === 'development'
    ? pino({
        ...baseOptions,
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss' },
        },
      })
    : pino(baseOptions);
