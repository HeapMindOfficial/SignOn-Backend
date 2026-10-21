declare global {
  namespace Express {
    interface Response {
      success<T>(data: T, message?: string, statusCode?: number): Response;
    }

    interface Request {
      userId?: string;
    }
  }
}

export {};
