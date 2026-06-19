const CryptoEngine = (() => {
  const PBKDF2_ITERATIONS = 100000;
  const KEY_LENGTH = 256;
  const SALT_SIZE = 16;
  const IV_SIZE = 12;

  function toBase64(buf) {
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
  }

  function fromBase64(str) {
    const bin = atob(str);
    return Uint8Array.from(bin, c => c.charCodeAt(0));
  }

  async function deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async function encrypt(plaintext, password) {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_SIZE));
    const iv = crypto.getRandomValues(new Uint8Array(IV_SIZE));
    const key = await deriveKey(password, salt);
    const enc = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(plaintext)
    );

    const ciphertext = encrypted.slice(0, encrypted.byteLength - 16);
    const tag = encrypted.slice(encrypted.byteLength - 16);

    return JSON.stringify({
      salt: toBase64(salt),
      iv: toBase64(iv),
      ciphertext: toBase64(ciphertext),
      tag: toBase64(tag)
    });
  }

  async function decrypt(encryptedStr, password) {
    try {
      const { salt, iv, ciphertext, tag } = JSON.parse(encryptedStr);
      const saltBuf = fromBase64(salt);
      const ivBuf = fromBase64(iv);
      const ctBuf = fromBase64(ciphertext);
      const tagBuf = fromBase64(tag);

      const combined = new Uint8Array(ctBuf.length + tagBuf.length);
      combined.set(ctBuf);
      combined.set(tagBuf, ctBuf.length);

      const key = await deriveKey(password, saltBuf);
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBuf },
        key,
        combined
      );

      return new TextDecoder().decode(decrypted);
    } catch (e) {
      throw new Error('Invalid Password / Data Corrupted');
    }
  }

  return { encrypt, decrypt };
})();
