import { randomUUID } from 'node:crypto';

import type { Request, Response } from 'express';
import { pinoHttp } from 'pino-http';

import { logger } from '../config/logger.js';

export const requestLogger = pinoHttp<Request, Response>({
  logger,
  genReqId: (req, res) => {
    const existingId = req.headers['x-request-id'];
    const id = typeof existingId === 'string' ? existingId : randomUUID();
    res.setHeader('X-Request-Id', id);
    return id;
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req, res) => `${req.method} ${req.originalUrl} -> ${res.statusCode}`,
  customErrorMessage: (req, res, err) =>
    `${req.method} ${req.originalUrl} -> ${res.statusCode} (${err.message})`,
});
