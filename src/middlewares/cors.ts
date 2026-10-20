import cors from 'cors';

import { isOriginAllowed } from '../services/cors.service.js';
import { ApiError } from '../utils/ApiError.js';

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || isOriginAllowed(origin)) {
      callback(null, true);
      return;
    }
    callback(ApiError.forbidden(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
});
