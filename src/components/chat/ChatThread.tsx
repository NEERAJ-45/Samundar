'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { Users, MessageCircle } from 'lucide-react';

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
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="flex items-center gap-3 my-4 px-3 sm:px-4" role="separator" aria-label={label}>
      <div className="flex-1 h-px bg-border/60" />
      <span className="text-[11px] font-medium text-muted-foreground/70 select-none tracking-wide uppercase">
        {label}
      </span>
      <div className="flex-1 h-px bg-border/60" />
    </div>
  );
}

function isNearBottom(el: HTMLElement) {
  return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
}

export function ChatThread({ username }: Props) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastFetchRef = useRef<string>('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  const loadMessages = useCallback(async () => {
    if (pausedRef.current) return;
    try {
      const params = new URLSearchParams();
      if (lastFetchRef.current) params.set('since', lastFetchRef.current);
      const res = await fetch(`/api/chat/messages?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      const msgs: ChatMsg[] = data.messages ?? [];
      if (msgs.length > 0) {
        const scrollEl = scrollRef.current;
        const wasAtBottom = scrollEl ? isNearBottom(scrollEl) : true;

        setMessages((prev) => {
          const existing = new Set(prev.map((m) => m.id));
          const newMsgs = msgs.filter((m) => !existing.has(m.id));
          return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev;
        });
        lastFetchRef.current = msgs[msgs.length - 1].createdAt;

        if (wasAtBottom) {
          requestAnimationFrame(() => {
            bottomRef.current?.scrollIntoView();
          });
        }
      }
    } catch {
      // silent
    }
  }, []);

  // Poll — pause when tab hidden
  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);

    const onVisibility = () => {
      pausedRef.current = document.hidden;
      if (!document.hidden) loadMessages();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [loadMessages]);

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
    <div className="flex flex-col h-full min-h-0" role="main" aria-label="Group chat">
      {/* Header */}
      <header className="shrink-0 border-b bg-background/90 backdrop-blur-sm px-3 sm:px-4 py-2.5 flex items-center gap-3 pt-[env(safe-area-inset-top)]">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center" aria-hidden="true">
          <Users className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-sm leading-tight truncate">Group Chat</h1>
          <p className="text-[11px] text-muted-foreground/70 leading-tight">Everyone can see messages</p>
        </div>
        <div className="flex items-center gap-1.5" aria-label="Online">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          <span className="text-[11px] text-muted-foreground/60 font-medium">Live</span>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
        role="log"
        aria-label="Messages"
        aria-live="polite"
      >
        <div className="py-3 sm:py-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-56 sm:h-64 text-center px-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-muted/60 flex items-center justify-center mb-3 sm:mb-4" aria-hidden="true">
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-foreground/80 mb-1">No messages yet</p>
              <p className="text-[13px] text-muted-foreground/60 max-w-[240px]">
                Start the conversation by sending a message below.
              </p>
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
      </div>

      {/* Input */}
      <div className="shrink-0 border-t pb-[env(safe-area-inset-bottom)]">
        <MessageInput onSend={handleSend} disabled={sending} />
      </div>
    </div>
  );
}
