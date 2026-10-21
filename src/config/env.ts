import 'dotenv/config';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  mongodbUser: requireEnv('MONGODB_USER'),
  mongodbPassword: requireEnv('MONGODB_PASSWORD'),
  mongodbUri: requireEnv('MONGODB_URI'),
  corsRefreshIntervalMs: Number(process.env.CORS_REFRESH_INTERVAL_MS ?? 60_000),
  shutdownTimeoutMs: Number(process.env.SHUTDOWN_TIMEOUT_MS ?? 10_000),
  logLevel: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  jwtSecret: requireEnv('JWT_SECRET'),
  accessTokenTtlSeconds: Number(process.env.ACCESS_TOKEN_TTL_SECONDS ?? 900),
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 30),
};
