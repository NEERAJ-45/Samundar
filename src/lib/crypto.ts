import sodium from 'libsodium-wrappers';

export interface IdentityKeypair {
  publicKey: string;  // base64
  privateKey: string; // base64
  userId: string;
}

export interface EncryptedMessage {
  nonce: string;    // base64
  ciphertext: string; // base64
}

export interface MessagePayload {
  senderId: string;
  seq: number;
  ts: number;
  text: string;
}

let sodiumReady = false;

async function ensureSodium() {
  if (!sodiumReady) {
    await sodium.ready;
    sodiumReady = true;
  }
}

export async function generateIdentity(userId: string): Promise<IdentityKeypair> {
  await ensureSodium();
  const keyPair = sodium.crypto_box_keypair();
  return {
    publicKey: sodium.to_base64(keyPair.publicKey),
    privateKey: sodium.to_base64(keyPair.privateKey),
    userId,
  };
}

export async function encryptFor(
  recipientPublicKeyB64: string,
  senderPrivateKeyB64: string,
  payload: MessagePayload
): Promise<EncryptedMessage> {
  await ensureSodium();
  const recipientPub = sodium.from_base64(recipientPublicKeyB64);
  const senderPriv = sodium.from_base64(senderPrivateKeyB64);
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
  const messageBytes = sodium.from_string(JSON.stringify(payload));
  const ciphertext = sodium.crypto_box_easy(messageBytes, nonce, recipientPub, senderPriv);
  return {
    nonce: sodium.to_base64(nonce),
    ciphertext: sodium.to_base64(ciphertext),
  };
}

export async function decryptWith(
  ciphertextB64: string,
  nonceB64: string,
  senderPublicKeyB64: string,
  recipientPrivateKeyB64: string
): Promise<MessagePayload> {
  await ensureSodium();
  const ciphertext = sodium.from_base64(ciphertextB64);
  const nonce = sodium.from_base64(nonceB64);
  const senderPub = sodium.from_base64(senderPublicKeyB64);
  const recipientPriv = sodium.from_base64(recipientPrivateKeyB64);
  const decrypted = sodium.crypto_box_open_easy(ciphertext, nonce, senderPub, recipientPriv);
  if (!decrypted) {
    throw new Error('INTEGRITY_FAILED');
  }
  return JSON.parse(sodium.to_string(decrypted));
}

export async function deriveSafetyCode(pubKeyA: string, pubKeyB: string): Promise<string> {
  await ensureSodium();
  const a = sodium.from_base64(pubKeyA);
  const b = sodium.from_base64(pubKeyB);
  const [smaller, larger] = a.length < b.length || 
    (a.length === b.length && sodium.to_base64(a) < sodium.to_base64(b))
    ? [a, b] : [b, a];
  const combined = new Uint8Array(smaller.length + larger.length);
  combined.set(smaller, 0);
  combined.set(larger, smaller.length);
  const hash = sodium.crypto_hash_sha256(combined);
  const hex = sodium.to_hex(hash).slice(0, 6).toUpperCase();
  return hex;
}
