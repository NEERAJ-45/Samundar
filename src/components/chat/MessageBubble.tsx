'use client';

import { cn } from '@/lib/utils';
import { EmojiText } from './EmojiText';

interface Props {
  from: string;
  text: string;
  ts: number;
  isOwn: boolean;
  showName?: boolean;
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500',
  'bg-orange-500', 'bg-pink-500', 'bg-teal-500',
  'bg-indigo-500', 'bg-red-500', 'bg-cyan-500',
  'bg-amber-500', 'bg-emerald-500', 'bg-violet-500',
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export function MessageBubble({ from, text, ts, isOwn, showName = true }: Props) {
  return (
    <div className={cn('flex gap-2 my-1 px-1 group', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      {!isOwn && (
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1',
            getAvatarColor(from)
          )}
        >
          {getInitials(from)}
        </div>
      )}
      <div className={cn('flex flex-col max-w-[75%]', isOwn ? 'items-end' : 'items-start')}>
        {showName && !isOwn && (
          <span className="text-xs font-medium text-muted-foreground mb-1 ml-1">{from}</span>
        )}
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words',
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted rounded-bl-md'
          )}
        >
          <span className="whitespace-pre-wrap break-words">
            <EmojiText text={text} />
          </span>
        </div>
        <span className={cn(
          'text-[10px] text-muted-foreground mt-1 mx-1 opacity-0 group-hover:opacity-100 transition-opacity',
        )}>
          {new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
