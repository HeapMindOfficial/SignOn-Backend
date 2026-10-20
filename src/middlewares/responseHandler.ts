import type { NextFunction, Request, Response } from 'express';

import { successResponse } from '../utils/apiResponse.js';

export function responseHandler(_req: Request, res: Response, next: NextFunction): void {
  res.success = <T>(data: T, message = 'Success', statusCode = 200): Response =>
    res.status(statusCode).json(successResponse(data, message, statusCode));

  next();
}
