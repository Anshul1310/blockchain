export class EncryptionService {
  


  static async encryptMessage(plaintext: string, secretPassphrase: string): Promise<{ ciphertextBase64: string; ivBase64: string }> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(secretPassphrase),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    const salt = encoder.encode('blindhire_salt_2026');
    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    return {
      ciphertextBase64: btoa(String.fromCharCode(...new Uint8Array(encryptedContent))),
      ivBase64: btoa(String.fromCharCode(...iv)),
    };
  }

  


  static async decryptMessage(ciphertextBase64: string, ivBase64: string, secretPassphrase: string): Promise<string> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const encryptedData = Uint8Array.from(atob(ciphertextBase64), (c) => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));

    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(secretPassphrase),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    const salt = encoder.encode('blindhire_salt_2026');
    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    const decryptedContent = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );

    return decoder.decode(decryptedContent);
  }
}
