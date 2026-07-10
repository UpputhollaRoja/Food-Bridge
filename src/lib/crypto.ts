import nacl from 'tweetnacl';

// Utility functions for encoding/decoding

export function encodeUTF8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

export function decodeUTF8(arr: Uint8Array): string {
  return new TextDecoder().decode(arr);
}

export function encodeBase64(arr: Uint8Array): string {
  // Use Buffer in Node, or btoa in browser
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(arr).toString('base64');
  }
  const bin = Array.from(arr).map(b => String.fromCharCode(b)).join('');
  return btoa(bin);
}

export function decodeBase64(str: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    const b = Buffer.from(str, 'base64');
    return new Uint8Array(b.buffer, b.byteOffset, b.length);
  }
  const bin = atob(str);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    arr[i] = bin.charCodeAt(i);
  }
  return arr;
}

// Key Generation

export interface KeyPair {
  publicKey: string; // Base64
  secretKey: string; // Base64
}

export function generateKeyPair(): KeyPair {
  const pair = nacl.box.keyPair();
  return {
    publicKey: encodeBase64(pair.publicKey),
    secretKey: encodeBase64(pair.secretKey),
  };
}

// Self-Data Encryption (e.g. Phone, Address)
// Encrypts data from the user to themselves

export interface EncryptedMessage {
  nonce: string; // Base64
  ciphertext: string; // Base64
}

export function encryptForSelf(
  plaintext: string,
  secretKeyBase64: string,
  publicKeyBase64: string
): EncryptedMessage {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const messageUint8 = encodeUTF8(plaintext);
  const secretKey = decodeBase64(secretKeyBase64);
  const publicKey = decodeBase64(publicKeyBase64);

  const nonceArr = new Uint8Array(nonce);
  const messageArr = new Uint8Array(messageUint8);
  const pubArr = new Uint8Array(publicKey);
  const secArr = new Uint8Array(secretKey);

  const encrypted = nacl.box(messageArr, nonceArr, pubArr, secArr);

  return {
    nonce: encodeBase64(nonce),
    ciphertext: encodeBase64(encrypted),
  };
}

export function decryptForSelf(
  encrypted: EncryptedMessage,
  secretKeyBase64: string,
  publicKeyBase64: string
): string | null {
  try {
    const nonce = decodeBase64(encrypted.nonce);
    const ciphertext = decodeBase64(encrypted.ciphertext);
    const secretKey = decodeBase64(secretKeyBase64);
    const publicKey = decodeBase64(publicKeyBase64);

    const nonceArr = new Uint8Array(nonce);
    const cipherArr = new Uint8Array(ciphertext);
    const pubArr = new Uint8Array(publicKey);
    const secArr = new Uint8Array(secretKey);

    const decrypted = nacl.box.open(cipherArr, nonceArr, pubArr, secArr);
    if (!decrypted) return null;

    return decodeUTF8(decrypted);
  } catch (err) {
    console.error('Decryption error:', err);
    return null;
  }
}

// Envelope Encryption (for Shared Chat/Notes)

export function generateSymmetricKey(): string {
  const key = nacl.randomBytes(nacl.secretbox.keyLength);
  return encodeBase64(key);
}

export function encryptSharedData(
  plaintext: string,
  symmetricKeyBase64: string
): EncryptedMessage {
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const messageUint8 = encodeUTF8(plaintext);
  const key = decodeBase64(symmetricKeyBase64);

  const nonceArr = new Uint8Array(nonce);
  const messageArr = new Uint8Array(messageUint8);
  const keyArr = new Uint8Array(key);

  const encrypted = nacl.secretbox(messageArr, nonceArr, keyArr);

  return {
    nonce: encodeBase64(nonce),
    ciphertext: encodeBase64(encrypted),
  };
}

export function decryptSharedData(
  encrypted: EncryptedMessage,
  symmetricKeyBase64: string
): string | null {
  try {
    const nonce = decodeBase64(encrypted.nonce);
    const ciphertext = decodeBase64(encrypted.ciphertext);
    const key = decodeBase64(symmetricKeyBase64);

    const nonceArr = new Uint8Array(nonce);
    const cipherArr = new Uint8Array(ciphertext);
    const keyArr = new Uint8Array(key);

    const decrypted = nacl.secretbox.open(cipherArr, nonceArr, keyArr);
    if (!decrypted) return null;

    return decodeUTF8(decrypted);
  } catch (err) {
    console.error('Decryption error:', err);
    return null;
  }
}

// Wrap/Unwrap symmetric keys using asymmetric box

export function wrapSymmetricKey(
  symmetricKeyBase64: string,
  senderSecretKeyBase64: string,
  recipientPublicKeyBase64: string
): EncryptedMessage {
  return encryptForSelf(
    symmetricKeyBase64,
    senderSecretKeyBase64,
    recipientPublicKeyBase64
  );
}

export function unwrapSymmetricKey(
  wrappedKey: EncryptedMessage,
  recipientSecretKeyBase64: string,
  senderPublicKeyBase64: string
): string | null {
  return decryptForSelf(
    wrappedKey,
    recipientSecretKeyBase64,
    senderPublicKeyBase64
  );
}
