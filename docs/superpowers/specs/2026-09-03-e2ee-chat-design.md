# E2EE Chat Module — Design Spec

**Date:** 2026-09-03
**Status:** Approved
**Scope:** Lightweight end-to-end encrypted group chat for a small trusted family

---

## 1. Overview

A zero-knowledge E2EE chat module for Next.js 16 (App Router) + TypeScript. A small family group (handful of known devices) can exchange encrypted messages through a relay server that never sees plaintext or private keys.

**Priorities (in order):**
1. Message integrity — recipient always detects tampering/corruption
2. Confidentiality — server/relay has zero access to plaintext or private keys
3. Reliability on restrictive networks — plain HTTPS polling, no WebSocket
4. Simplicity — small pre-coordinated group, not a general messaging platform

---

## 2. Encryption Design

### Primitives (libsodium only)

- **Key exchange:** X25519 (Curve25519 Diffie-Hellman)
- **Encryption:** `crypto_box` = X25519 key agreement + XSalsa20 stream cipher + Poly1305 MAC (AEAD)
- **Hashing:** SHA-256 (for safety code derivation)
- **Encoding:** Base64 for transport

### Key Management

- Each device generates one long-term X25519 identity keypair client-side
- Private key stored in IndexedDB, never leaves the device
- Public key registered with the relay (POST `/api/chat/keys`)
- No prekeys, no X3DH, no ratchet — direct pairwise `crypto_box` with long-term keys

### Message Format (encrypted payload)

```
{
  "senderId": string,    // sender's user ID
  "seq": number,         // per-sender sequence number (monotonic)
  "ts": number,          // Unix timestamp (ms)
  "text": string         // plaintext message
}
```

This entire object is encrypted as a single `crypto_box` call. The sequence number and timestamp are inside the ciphertext, covered by the Poly1305 auth tag.

### Integrity Guarantee

Any tampering with the ciphertext (bit flip, truncation, substitution) causes the Poly1305 auth tag to fail. `crypto_box_open` throws rather than returning garbled data. The UI explicitly shows "⚠ integrity check failed" for any decryption failure — never silently drops.

### Replay/Reorder Detection

- Sequence numbers are monotonically increasing per sender
- Client tracks `lastSeenSeq[senderId]` in IndexedDB
- Messages with seq ≤ lastSeenSeq are discarded as replays
- Messages arriving out of order (seq > lastSeenSeq + 1) are accepted but flagged as potentially missing

### Fan-out Model

The sender encrypts the message once per recipient (separate `crypto_box` call with each recipient's public key) and POSTs each ciphertext to the relay. For a group of N people, the sender makes N encryptions and N POST requests. This keeps the relay truly zero-knowledge (it never learns group membership).

---

## 3. Safety Code (MITM Detection)

### Derivation

1. Take both parties' public keys (32 bytes each)
2. Concatenate in lexicographic order (smaller key first) to ensure both parties derive the same code
3. SHA-256 the concatenation
4. Take first 6 hex characters of the hash → "ABC123" format

### Usage

- Displayed during contact addition (QR code flow or paste flow)
- Both parties verbally confirm the same 6-character code (phone call or in person)
- If codes match, MITM by the relay is ruled out

---

## 4. Backend (Next.js API Routes)

### MongoDB Models

```typescript
// ChatKey — public key registry
{
  userId: string;      // unique, indexed
  publicKey: string;   // base64-encoded 32-byte X25519 public key
  updatedAt: Date;
}

// ChatMessage — ciphertext store
{
  from: string;        // sender userId
  to: string;          // recipient userId
  nonce: string;       // base64-encoded 24-byte nonce
  ciphertext: string;  // base64-encoded ciphertext
  createdAt: Date;     // indexed, TTL or capped
}
```

**No plaintext field. No message content field. Document this constraint in code comments.**

### API Endpoints

#### `POST /api/chat/keys`
- Body: `{ userId: string, publicKey: string }`
- Upserts the user's public key
- Returns: `{ ok: true }`

#### `GET /api/chat/keys?userId=`
- Returns: `{ userId, publicKey, updatedAt }`
- 404 if not found

#### `POST /api/chat/messages`
- Body: `{ from: string, to: string, nonce: string, ciphertext: string }`
- Stores ciphertext
- Returns: `{ ok: true, id: string }`

#### `GET /api/chat/messages?userId=&since=`
- Returns all messages where `to === userId` and `createdAt > since`
- `since` is an ISO timestamp or epoch ms
- Returns: `{ messages: [...] }`
- Messages are NOT deleted after retrieval (re-polling is safe; client deduplicates by seq)

### Authentication

Routes use the existing auth pattern (`auth()` for session check). The `userId` in the request must match the authenticated user for POST operations. GET operations are scoped to the authenticated user's inbox.

---

## 5. Client Architecture

### IndexedDB Storage (`lib/db.ts`)

Four object stores:

| Store | Key | Fields |
|-------|-----|--------|
| `identity` | `keyPair` | `{ publicKey, privateKey, userId }` |
| `contacts` | `userId` | `{ userId, publicKey, displayName, safetyCodeVerified, addedAt }` |
| `messages` | auto-increment | `{ id, from, to, text, seq, ts, status, integrityError? }` |
| `syncState` | `key` | `{ lastPollTimestamp, lastSeenSeq[senderId] }` |

### Polling Loop (`lib/sync.ts`)

- Runs in a `useEffect` at the **app level** (in the chat layout or a provider), NOT per-thread
- Polls `GET /api/chat/messages?userId=X&since=Y` every 2.5 seconds
- For each received ciphertext:
  1. Look up sender's public key from IndexedDB contacts
  2. Attempt `crypto_box_open(ciphertext, nonce, senderPub, myPriv)`
  3. On success: parse `{ senderId, seq, ts, text }`, check seq > lastSeenSeq, store in IndexedDB
  4. On failure: store message with `integrityError: true`, render "⚠ integrity check failed"
- Updates `lastPollTimestamp` after each successful poll
- Runs across ALL contacts regardless of which chat thread is currently open

### Delivery Status

- **Sending**: Spinner while POST is in flight
- **Sent**: POST returned 200
- **Timeout**: If no confirmation within 8 seconds, show "⚠ Not confirmed — consider calling/texting as backup"
- Status stored in IndexedDB per message

---

## 6. UI Components

### Route: `(dashboard)/chat/page.tsx`

Chat page with sidebar contact list and main message area.

### Components (`src/components/chat/`)

| Component | Purpose |
|-----------|---------|
| `ChatLayout.tsx` | App-level layout with polling provider |
| `ContactList.tsx` | Sidebar showing contacts with safety-code-verified status |
| `ChatThread.tsx` | Message thread for the group conversation |
| `MessageBubble.tsx` | Single message with delivery status + integrity error state |
| `MessageInput.tsx` | Text input + send button |
| `SetupWizard.tsx` | First-time keypair generation + public key registration |
| `AddContactDialog.tsx` | QR code display/scanner + manual paste + safety code verification |
| `SafetyCodeDisplay.tsx` | Shows 6-char code + verification confirmation |
| `QRCode.tsx` | QR code generation for public key exchange |

### Onboarding Flow

1. User opens `/chat` for the first time
2. `SetupWizard` generates X25519 keypair via libsodium
3. Private key stored in IndexedDB
4. Public key POSTed to relay
5. User is ready to add contacts

### Add Contact Flow

1. Click "Add Contact" → `AddContactDialog` opens
2. Option A: Display QR code (public key + userId encoded) for other device to scan
3. Option B: Paste public key manually
4. Safety code derived and displayed: "Your safety code: ABC123"
5. Both parties confirm verbally (phone/in-person)
6. Contact stored in IndexedDB with `safetyCodeVerified: true`

---

## 7. Threat Model

### What This Protects Against

| Threat | Mitigation |
|--------|-----------|
| Message tampering in transit | Poly1305 AEAD auth tag — any modification causes decryption failure |
| Message tampering on server | Ciphertext stored; server has no key to modify and re-encrypt |
| Relay reading messages | Zero-knowledge: server only stores ciphertext, never sees plaintext or private keys |
| MITM key substitution | Safety code verification (6-char hash of both public keys, confirmed out-of-band) |
| Replay attacks | Sequence numbers inside encrypted payload, monotonic per sender |
| Corporate proxy inspection | HTTPS polling only — no WebSocket upgrade that proxies might block |

### What This Does NOT Protect Against

| Limitation | Reason |
|-----------|--------|
| Forward secrecy | Long-term keypair per device; no Double Ratchet/Signal protocol. If a private key is compromised, all past messages are decryptable |
| Metadata protection | Server sees: who talks to whom, when, how often, message sizes. No padding or mixing |
| Device compromise | Private key stored in IndexedDB; if device is stolen/unlocked, all messages accessible |
| Group membership privacy | All registered users visible via the keys endpoint |
| Disappearing messages | No auto-delete (relies on client-side deletion only) |
| Denial of service | Relay can refuse to deliver or drop messages (client has no fallback) |
| Quantum resistance | X25519 is not post-quantum secure |

---

## 8. Dependencies

- `libsodium-wrappers` — all cryptographic operations (client-side only)
- No new server-side crypto dependencies

---

## 9. File Manifest

| File | Layer | Purpose |
|------|-------|---------|
| `src/lib/crypto.ts` | Crypto | libsodium wrappers: keygen, encrypt, decrypt, safetyCode |
| `src/lib/db.ts` | Client DB | IndexedDB CRUD for identity, contacts, messages, syncState |
| `src/lib/sync.ts` | Sync | Polling loop, decrypt-and-store, app-level across all contacts |
| `src/lib/models/ChatKey.ts` | Server | Mongoose model for public key registry |
| `src/lib/models/ChatMessage.ts` | Server | Mongoose model for ciphertext store |
| `src/app/api/chat/keys/route.ts` | Server | POST/GET public keys |
| `src/app/api/chat/messages/route.ts` | Server | POST/GET ciphertext |
| `src/components/chat/ChatLayout.tsx` | UI | Chat layout with polling provider |
| `src/components/chat/ContactList.tsx` | UI | Contact sidebar |
| `src/components/chat/ChatThread.tsx` | UI | Message thread |
| `src/components/chat/MessageBubble.tsx` | UI | Message with status/error |
| `src/components/chat/MessageInput.tsx` | UI | Text input + send |
| `src/components/chat/SetupWizard.tsx` | UI | First-time keypair setup |
| `src/components/chat/AddContactDialog.tsx` | UI | Add contact + safety code |
| `src/components/chat/SafetyCodeDisplay.tsx` | UI | Safety code display |
| `src/components/chat/QRCode.tsx` | UI | QR code for key exchange |
| `src/app/(dashboard)/chat/page.tsx` | UI | Chat page route |
| `docs/superpowers/specs/2026-09-03-e2ee-chat-design.md` | Docs | This spec |
