const crypto = require('crypto');

// Encrypts gateway secrets (e.g. the PayPal Client Secret) before they are stored in MongoDB.
// AES-256-GCM. Key comes from SETTINGS_ENCRYPTION_KEY (falls back to a hash of JWT_SECRET so a
// deployment without the extra variable still works; set a dedicated key in production).
function key() {
  const raw = process.env.SETTINGS_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!raw) throw new Error('SETTINGS_ENCRYPTION_KEY (or JWT_SECRET) must be set to store payment secrets');
  return crypto.createHash('sha256').update(String(raw)).digest();
}

function encrypt(plain) {
  if (plain === undefined || plain === null || plain === '') return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64'), cipher.getAuthTag().toString('base64'), enc.toString('base64')].join(':');
}

function decrypt(payload) {
  if (!payload) return '';
  const [v, iv, tag, data] = String(payload).split(':');
  if (v !== 'v1') return '';
  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    return Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]).toString('utf8');
  } catch {
    return ''; // wrong key / tampered value -> treated as "not configured"
  }
}

module.exports = { encrypt, decrypt };
