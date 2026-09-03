'use client';

import { useEffect, useRef, useState } from 'react';
import { getIdentity, getMessages, addMessage, updateMessageStatus, getContact, type StoredMessage } from '@/lib/chat-db';
import { encryptFor } from '@/lib/crypto';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  contactUserId: string;
}

export function ChatThread({ contactUserId }: Props) {
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, [contactUserId]);

  useEffect(() => {
    const interval = setInterval(loadMessages, 2500);
    return () => clearInterval(interval);
  }, [contactUserId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 8-second delivery timeout: mark long-sending messages as failed
  useEffect(() => {
    const interval = setInterval(async () => {
      const all = await getMessages();
      const stale = all.filter(
        (m) => m.status === 'sending' && Date.now() - m.ts > 8000
      );
      for (const m of stale) {
        if (m.id) await updateMessageStatus(m.id, 'failed');
      }
      if (stale.length > 0) await loadMessages();
    }, 5000);
    return () => clearInterval(interval);
  }, [contactUserId]);

  async function loadMessages() {
    const allMessages = await getMessages();
    const filtered = allMessages.filter(
      (m) =>
        (m.from === contactUserId || m.to === contactUserId) &&
        !m.integrityError
    );
    setMessages(filtered);
  }

  const handleSend = async (text: string) => {
    const identity = await getIdentity();
    const contact = await getContact(contactUserId);
    if (!identity || !contact) return;

    setSending(true);
    try {
      const lastMsg = messages.filter((m) => m.from === identity.userId).pop();
      const seq = (lastMsg?.seq ?? 0) + 1;

      const encrypted = await encryptFor(
        contact.publicKey,
        identity.privateKey,
        { senderId: identity.userId, seq, ts: Date.now(), text }
      );

      const msgId = await addMessage({
        from: identity.userId,
        to: contactUserId,
        text,
        seq,
        ts: Date.now(),
        status: 'sending',
      });

      await loadMessages();

      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: identity.userId,
          to: contactUserId,
          nonce: encrypted.nonce,
          ciphertext: encrypted.ciphertext,
        }),
      });

      await updateMessageStatus(msgId, res.ok ? 'sent' : 'failed');
      await loadMessages();
    } catch {
      console.error('Send failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <h3 className="font-semibold text-sm">{contactUserId}</h3>
      </div>
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        {messages.length === 0 && (
          <p className="text-muted-foreground text-sm text-center mt-8">
            No messages yet. Send the first one.
          </p>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.from !== contactUserId}
          />
        ))}
      </ScrollArea>
      <MessageInput onSend={handleSend} disabled={sending} />
    </div>
  );
}
