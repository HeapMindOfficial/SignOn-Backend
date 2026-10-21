import { SignJWT, jwtVerify } from 'jose';

import { env } from '../config/env.js';

const secretKey = new TextEncoder().encode(env.jwtSecret);

export async function signAccessToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${env.accessTokenTtlSeconds}s`)
    .sign(secretKey);
}

export async function verifyAccessToken(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, secretKey);
  if (typeof payload.sub !== 'string') {
    throw new Error('Token is missing a subject claim');
  }
  return payload.sub;
}
