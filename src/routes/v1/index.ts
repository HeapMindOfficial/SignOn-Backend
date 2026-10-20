import { Router } from 'express';

import { corsRulesRouter } from './corsRules.routes.js';
import { healthRouter } from './health.routes.js';

export const v1Router = Router();

v1Router.use((_req, res, next) => {
  res.setHeader('X-API-Version', 'v1');
  next();
});

v1Router.use('/health', healthRouter);
v1Router.use('/cors-rules', corsRulesRouter);
