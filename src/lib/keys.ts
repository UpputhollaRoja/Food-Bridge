import { get, set } from 'idb-keyval';
import { generateKeyPair, KeyPair } from './crypto';

const KEY_PREFIX = 'foodbridge_keys_';

/**
 * Retrieves the user's keypair from IndexedDB.
 */
export async function getUserKeys(userId: string): Promise<KeyPair | null> {
  const keys = await get<KeyPair>(`${KEY_PREFIX}${userId}`);
  return keys || null;
}

/**
 * Generates a new keypair and saves it to IndexedDB.
 */
export async function generateAndSaveUserKeys(userId: string): Promise<KeyPair> {
  const existing = await getUserKeys(userId);
  if (existing) {
    return existing;
  }

  const keys = generateKeyPair();
  await set(`${KEY_PREFIX}${userId}`, keys);
  return keys;
}

/**
 * Stores an existing keypair to IndexedDB (e.g. for key recovery).
 */
export async function saveUserKeys(userId: string, keys: KeyPair): Promise<void> {
  await set(`${KEY_PREFIX}${userId}`, keys);
}
