'use client';

import { type StoredMessage } from '@/lib/chat-db';
import { cn } from '@/lib/utils';
import { AlertTriangle, Check, Loader2 } from 'lucide-react';

interface Props {
  message: StoredMessage;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: Props) {
  if (message.integrityError) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg px-4 py-2 text-sm flex items-center gap-2 max-w-md">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>⚠ Integrity check failed — message may be corrupted</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex my-1', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-xs lg:max-w-md rounded-lg px-4 py-2 text-sm',
          isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <div className={cn(
          'flex items-center gap-1 mt-1 text-xs',
          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
        )}>
          <span>{new Date(message.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {isOwn && (
            <span className="ml-1">
              {message.status === 'sending' && <Loader2 className="h-3 w-3 animate-spin" />}
              {message.status === 'sent' && <Check className="h-3 w-3" />}
              {message.status === 'failed' && (
                <span className="ml-1 text-yellow-500" title="Not confirmed — try calling or texting">⚠</span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
