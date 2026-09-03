import { type IdentityKeypair, type MessagePayload } from './crypto';

const DB_NAME = 'samundar-e2ee-chat';
const DB_VERSION = 1;

export interface Contact {
  userId: string;
  publicKey: string;
  displayName: string;
  safetyCodeVerified: boolean;
  addedAt: number;
}

export interface StoredMessage {
  id?: number;
  from: string;
  to: string;
  text: string;
  seq: number;
  ts: number;
  status: 'sending' | 'sent' | 'failed';
  integrityError?: boolean;
}

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('identity')) {
        db.createObjectStore('identity', { keyPath: 'keyPair' });
      }
      if (!db.objectStoreNames.contains('contacts')) {
        db.createObjectStore('contacts', { keyPath: 'userId' });
      }
      if (!db.objectStoreNames.contains('messages')) {
        const store = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
        store.createIndex('from', 'from', { unique: false });
        store.createIndex('to', 'to', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }
      if (!db.objectStoreNames.contains('syncState')) {
        db.createObjectStore('syncState', { keyPath: 'key' });
      }
    };
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  });
}

function txStore(storeName: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
  return openDB().then(db => {
    const tx = db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function initDB(): Promise<void> {
  await openDB();
}

export async function getIdentity(): Promise<IdentityKeypair | null> {
  const store = await txStore('identity', 'readonly');
  const result = await requestToPromise(store.get('keyPair'));
  return result?.value ?? null;
}

export async function saveIdentity(identity: IdentityKeypair): Promise<void> {
  const store = await txStore('identity', 'readwrite');
  await requestToPromise(store.put({ keyPair: 'keyPair', value: identity }));
}

export async function getContacts(): Promise<Contact[]> {
  const store = await txStore('contacts', 'readonly');
  return requestToPromise(store.getAll());
}

export async function addContact(contact: Contact): Promise<void> {
  const store = await txStore('contacts', 'readwrite');
  await requestToPromise(store.put(contact));
}

export async function getContact(userId: string): Promise<Contact | undefined> {
  const store = await txStore('contacts', 'readonly');
  return requestToPromise(store.get(userId));
}

export async function getMessages(): Promise<StoredMessage[]> {
  const store = await txStore('messages', 'readonly');
  return requestToPromise(store.getAll());
}

export async function addMessage(message: StoredMessage): Promise<number> {
  const store = await txStore('messages', 'readwrite');
  return requestToPromise(store.add(message));
}

export async function updateMessageStatus(
  id: number,
  status: StoredMessage['status']
): Promise<void> {
  const store = await txStore('messages', 'readwrite');
  const msg = await requestToPromise(store.get(id));
  if (msg) {
    msg.status = status;
    await requestToPromise(store.put(msg));
  }
}

export async function getLastSeenSeq(senderId: string): Promise<number> {
  const store = await txStore('syncState', 'readonly');
  const result = await requestToPromise(store.get(`seq:${senderId}`));
  return result?.value ?? 0;
}

export async function setLastSeenSeq(senderId: string, seq: number): Promise<void> {
  const store = await txStore('syncState', 'readwrite');
  await requestToPromise(store.put({ key: `seq:${senderId}`, value: seq }));
}

export async function getLastPollTimestamp(): Promise<string> {
  const store = await txStore('syncState', 'readonly');
  const result = await requestToPromise(store.get('lastPoll'));
  return result?.value ?? new Date(0).toISOString();
}

export async function setLastPollTimestamp(ts: string): Promise<void> {
  const store = await txStore('syncState', 'readwrite');
  await requestToPromise(store.put({ key: 'lastPoll', value: ts }));
}
