import cookieParser from 'cookie-parser';
import express, { type Application } from 'express';
import helmet from 'helmet';

import { corsMiddleware } from './middlewares/cors.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { responseHandler } from './middlewares/responseHandler.js';
import { apiRouter } from './routes/index.js';

export function createApp(): Application {
  const app = express();

  app.use(requestLogger);
  app.use(helmet());
  app.use(corsMiddleware);
  app.use(express.json());
  app.use(cookieParser());
  app.use(responseHandler);
  app.use('/api', apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
