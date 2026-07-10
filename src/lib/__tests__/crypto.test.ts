import { describe, it, expect } from 'vitest'
import {
  generateKeyPair,
  encryptForSelf,
  decryptForSelf,
  generateSymmetricKey,
  encryptSharedData,
  decryptSharedData,
  wrapSymmetricKey,
  unwrapSymmetricKey
} from '../crypto'

describe('E2E Encryption Crypto Module', () => {
  it('should generate asymmetric keypair', () => {
    const keys = generateKeyPair()
    expect(keys).toHaveProperty('publicKey')
    expect(keys).toHaveProperty('secretKey')
    expect(typeof keys.publicKey).toBe('string')
    expect(typeof keys.secretKey).toBe('string')
  })

  it('should encrypt and decrypt self-data successfully', () => {
    const keys = generateKeyPair()
    const plaintext = '123 Sustainability Way'

    const encrypted = encryptForSelf(plaintext, keys.secretKey, keys.publicKey)
    expect(encrypted).toHaveProperty('nonce')
    expect(encrypted).toHaveProperty('ciphertext')
    expect(encrypted.ciphertext).not.toEqual(plaintext)

    const decrypted = decryptForSelf(encrypted, keys.secretKey, keys.publicKey)
    expect(decrypted).toBe(plaintext)
  })

  it('should fail to decrypt self-data with wrong key', () => {
    const keys1 = generateKeyPair()
    const keys2 = generateKeyPair() // Wrong key
    const plaintext = 'Secret Data'

    const encrypted = encryptForSelf(plaintext, keys1.secretKey, keys1.publicKey)
    const decrypted = decryptForSelf(encrypted, keys2.secretKey, keys2.publicKey)
    expect(decrypted).toBeNull()
  })

  it('should encrypt and decrypt shared data with symmetric key', () => {
    const symKey = generateSymmetricKey()
    const plaintext = 'Hello Volunteer!'

    const encrypted = encryptSharedData(plaintext, symKey)
    expect(encrypted.ciphertext).not.toEqual(plaintext)

    const decrypted = decryptSharedData(encrypted, symKey)
    expect(decrypted).toBe(plaintext)
  })

  it('should wrap and unwrap symmetric keys via envelope encryption', () => {
    const sender = generateKeyPair()
    const receiver = generateKeyPair()
    const symKey = generateSymmetricKey()

    // Sender wraps the symmetric key using their secret key and receiver's public key
    const wrapped = wrapSymmetricKey(symKey, sender.secretKey, receiver.publicKey)

    // Receiver unwraps using their secret key and sender's public key
    const unwrapped = unwrapSymmetricKey(wrapped, receiver.secretKey, sender.publicKey)
    expect(unwrapped).toBe(symKey)
  })
})
