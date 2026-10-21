import { ScalableBloomFilter } from 'bloom-filters';

import { logger } from '../config/logger.js';
import {
  BLOOM_FILTER_ERROR_RATE,
  BLOOM_FILTER_INITIAL_SIZE,
} from '../constants/uniqueness.constants.js';
import { findAllUserIdentifiers } from '../repositories/user.repository.js';

let emailFilter = new ScalableBloomFilter(BLOOM_FILTER_INITIAL_SIZE, BLOOM_FILTER_ERROR_RATE);
let usernameFilter = new ScalableBloomFilter(BLOOM_FILTER_INITIAL_SIZE, BLOOM_FILTER_ERROR_RATE);

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export async function seedUniquenessFilters(): Promise<void> {
  const users = await findAllUserIdentifiers();

  emailFilter = new ScalableBloomFilter(
    Math.max(BLOOM_FILTER_INITIAL_SIZE, users.length),
    BLOOM_FILTER_ERROR_RATE,
  );
  usernameFilter = new ScalableBloomFilter(
    Math.max(BLOOM_FILTER_INITIAL_SIZE, users.length),
    BLOOM_FILTER_ERROR_RATE,
  );

  for (const user of users) {
    emailFilter.add(normalize(user.email));
    usernameFilter.add(normalize(user.username));
  }

  logger.info({ count: users.length }, 'Seeded email/username uniqueness filters');
}

/** False means definitely free; true means "maybe taken" — caller must confirm against the DB. */
export function mightEmailExist(email: string): boolean {
  return emailFilter.has(normalize(email));
}

/** False means definitely free; true means "maybe taken" — caller must confirm against the DB. */
export function mightUsernameExist(username: string): boolean {
  return usernameFilter.has(normalize(username));
}

export function registerEmail(email: string): void {
  emailFilter.add(normalize(email));
}

export function registerUsername(username: string): void {
  usernameFilter.add(normalize(username));
}
