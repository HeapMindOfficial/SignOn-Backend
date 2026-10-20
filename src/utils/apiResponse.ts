export interface SuccessResponseBody<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface ErrorResponseBody {
  success: false;
  statusCode: number;
  message: string;
  errors?: unknown;
  timestamp: string;
}

export function successResponse<T>(
  data: T,
  message = 'Success',
  statusCode = 200,
): SuccessResponseBody<T> {
  return { success: true, statusCode, message, data, timestamp: new Date().toISOString() };
}

export function errorResponse(
  message: string,
  statusCode: number,
  errors?: unknown,
): ErrorResponseBody {
  return {
    success: false,
    statusCode,
    message,
    timestamp: new Date().toISOString(),
    ...(errors !== undefined ? { errors } : {}),
  };
}
