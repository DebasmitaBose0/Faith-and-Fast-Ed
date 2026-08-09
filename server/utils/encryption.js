import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;
const KEY = (() => {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      'ENCRYPTION_KEY environment variable is required. ' +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  // aes-256-cbc needs a key of exactly 32 bytes. Deriving it with SHA-256 always produces that,
  // whatever the supplied value looks like — a 64-character hex string, a passphrase, anything.
  // The previous version passed a 32-character value straight to Buffer.from(raw, "hex"), which
  // decodes to 16 bytes (or fewer, when the value isn't valid hex), so createCipheriv failed with
  // "Invalid key length" for exactly the key length the setup docs steer people towards. Values
  // that already worked derive to the same key as before, so existing ciphertext still decrypts.
  const normalized = crypto.createHash('sha256').update(raw).digest('hex');
  return Buffer.from(normalized, 'hex');
})();

export function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(cipherText) {
  const parts = cipherText.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted text format');
  }
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

// An IV is 16 bytes, so a value this module encrypted always looks like 32 hex characters, a colon,
// then the ciphertext in hex. Anything that does not match that shape was never encrypted here.
const ENCRYPTED_FORMAT = /^[0-9a-f]{32}:[0-9a-f]+$/i;

/**
 * Decrypt a stored value that may predate the field being encrypted.
 *
 * Rows written before encryption was introduced hold plaintext, and handing those to `decrypt` throws
 * 'Invalid encrypted text format' — which surfaced as a 500 on the public payment-settings endpoint.
 * Values that were never encrypted are returned unchanged; values that are in the encrypted format
 * still decrypt strictly, so a real key mismatch or corrupted row is not silently swallowed.
 */
export function decryptIfEncrypted(value) {
  if (typeof value !== 'string' || value === '') return value;
  if (!ENCRYPTED_FORMAT.test(value)) return value;
  return decrypt(value);
}
