import type { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';

import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { errorResponse } from '../utils/apiResponse.js';

interface MongoDuplicateKeyError {
  code: 11000;
  keyValue?: Record<string, unknown>;
}

function isDuplicateKeyError(err: unknown): err is MongoDuplicateKeyError {
  return typeof err === 'object' && err !== null && (err as { code?: unknown }).code === 11000;
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: unknown;
  let isOperational = false;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
    isOperational = err.isOperational;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((validationError) => validationError.message);
    isOperational = true;
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid value for field "${err.path}"`;
    isOperational = true;
  } else if (isDuplicateKeyError(err)) {
    statusCode = 409;
    message = 'Duplicate value';
    details = err.keyValue;
    isOperational = true;
  } else if (err instanceof SyntaxError) {
    statusCode = 400;
    message = 'Invalid JSON payload';
    isOperational = true;
  } else if (err instanceof Error) {
    message = err.message;
  }

  if (isOperational) {
    console.warn(`[${req.method} ${req.originalUrl}] ${statusCode} ${message}`);
  } else {
    console.error(`[${req.method} ${req.originalUrl}]`, err);
  }

  const responseMessage =
    !isOperational && env.nodeEnv === 'production' ? 'Internal Server Error' : message;

  res.status(statusCode).json(errorResponse(responseMessage, statusCode, details));
};
