import mongoose from 'mongoose';

import { env } from './env.js';

function buildConnectionString(): string {
  const user = encodeURIComponent(env.mongodbUser);
  const password = encodeURIComponent(env.mongodbPassword);
  return `mongodb+srv://${user}:${password}@${env.mongodbUri}?retryWrites=true&w=majority`;
}

export async function connectDb(): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(buildConnectionString());
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
