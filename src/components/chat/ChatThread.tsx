'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users } from 'lucide-react';

interface ChatMsg {
  id: string;
  from: string;
  text: string;
  createdAt: string;
}

interface Props {
  username: string;
}

function DateSeparator({ date }: { date: string }) {
  const d = new Date(date);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const label = isToday
    ? 'Today'
    : isYesterday
      ? 'Yesterday'
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground font-medium shrink-0">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export function ChatThread({ username }: Props) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastFetchRef = useRef<string>('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (lastFetchRef.current) params.set('since', lastFetchRef.current);
      const res = await fetch(`/api/chat/messages?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      const msgs: ChatMsg[] = data.messages ?? [];
      if (msgs.length > 0) {
        setMessages((prev) => {
          const existing = new Set(prev.map((m) => m.id));
          const newMsgs = msgs.filter((m) => !existing.has(m.id));
          return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev;
        });
        lastFetchRef.current = msgs[msgs.length - 1].createdAt;
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string) => {
    setSending(true);
    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: username, text }),
      });
      await loadMessages();
    } catch {
      console.error('Send failed');
    } finally {
      setSending(false);
    }
  };

  const shouldShowName = (msgs: ChatMsg[], idx: number) => {
    if (idx === 0) return true;
    return msgs[idx].from !== msgs[idx - 1].from;
  };

  const shouldShowDate = (msgs: ChatMsg[], idx: number) => {
    if (idx === 0) return true;
    const prev = new Date(msgs[idx - 1].createdAt);
    const curr = new Date(msgs[idx].createdAt);
    return prev.toDateString() !== curr.toDateString();
  };

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {/* Header */}
      <div className="shrink-0 border-b bg-background/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-tight">Group Chat</h3>
            <p className="text-xs text-muted-foreground">Everyone can see messages</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="px-2 py-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Users className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium mb-1">No messages yet</p>
              <p className="text-sm text-muted-foreground/70">Start the conversation!</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={msg.id}>
              {shouldShowDate(messages, idx) && (
                <DateSeparator date={msg.createdAt} />
              )}
              <MessageBubble
                from={msg.from}
                text={msg.text}
                ts={new Date(msg.createdAt).getTime()}
                isOwn={msg.from === username}
                showName={shouldShowName(messages, idx)}
              />
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="shrink-0">
        <MessageInput onSend={handleSend} disabled={sending} />
      </div>
    </div>
  );
}
