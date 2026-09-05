import { decryptWith, type MessagePayload } from './crypto';
import {
  getIdentity,
  getContact,
  getLastSeenSeq,
  setLastSeenSeq,
  getLastPollTimestamp,
  setLastPollTimestamp,
  addMessage,
  type StoredMessage,
} from './chat-db';

let pollingInterval: ReturnType<typeof setInterval> | null = null;
let isPolling = false;

export type SyncCallbacks = {
  onMessage: (message: StoredMessage) => void;
  onIntegrityError: (from: string, seq: number) => void;
  onError: (error: Error) => void;
};

async function fetchNewMessages(userId: string, since: string): Promise<Array<{
  id: string;
  from: string;
  to: string;
  nonce: string;
  ciphertext: string;
  createdAt: string;
}>> {
  const params = new URLSearchParams({ userId, since });
  const res = await fetch(`/api/chat/messages?${params}`);
  if (!res.ok) throw new Error(`Poll failed: ${res.status}`);
  const data = await res.json();
  return data.messages ?? [];
}

export async function pollOnce(callbacks: SyncCallbacks): Promise<void> {
  if (isPolling) return;
  isPolling = true;

  try {
    const identity = await getIdentity();
    if (!identity) return;

    const since = await getLastPollTimestamp();
    const messages = await fetchNewMessages(identity.userId, since);

    for (const msg of messages) {
      const lastSeq = await getLastSeenSeq(msg.from);
      const contact = await getContact(msg.from);
      if (!contact) continue;

      let payload: MessagePayload;
      try {
        payload = await decryptWith(
          msg.ciphertext,
          msg.nonce,
          contact.publicKey,
          identity.privateKey
        );
      } catch {
        const storedMsg: StoredMessage = {
          from: msg.from,
          to: msg.to,
          text: '',
          seq: 0,
          ts: Date.now(),
          status: 'sent',
          integrityError: true,
        };
        const id = await addMessage(storedMsg);
        storedMsg.id = id;
        callbacks.onIntegrityError(msg.from, 0);
        callbacks.onMessage(storedMsg);
        continue;
      }

      if (payload.seq <= lastSeq) continue;

      const storedMsg: StoredMessage = {
        from: payload.senderId,
        to: identity.userId,
        text: payload.text,
        seq: payload.seq,
        ts: payload.ts,
        status: 'sent',
      };
      const id = await addMessage(storedMsg);
      storedMsg.id = id;

      await setLastSeenSeq(msg.from, payload.seq);
      callbacks.onMessage(storedMsg);
    }

    if (messages.length > 0) {
      await setLastPollTimestamp(new Date().toISOString());
    }
  } catch (error) {
    callbacks.onError(error as Error);
  } finally {
    isPolling = false;
  }
}

export function startPolling(
  callbacks: SyncCallbacks,
  intervalMs: number = 2500
): void {
  stopPolling();
  pollOnce(callbacks);
  pollingInterval = setInterval(() => pollOnce(callbacks), intervalMs);
}

export function stopPolling(): void {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}
