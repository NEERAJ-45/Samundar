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
  'bg-blue-600', 'bg-indigo-600', 'bg-emerald-600',
  'bg-amber-600', 'bg-rose-600', 'bg-cyan-600',
  'bg-violet-600', 'bg-teal-600', 'bg-pink-600',
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
    <div
      className={cn(
        'flex gap-2 my-0.5 px-3 sm:px-4 group',
        isOwn ? 'flex-row-reverse' : 'flex-row'
      )}
      role="article"
      aria-label={`Message from ${from}`}
    >
      {/* Avatar */}
      {!isOwn && (
        <div
          className={cn(
            'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-[10px] sm:text-[11px] font-semibold shrink-0 mt-auto',
            getAvatarColor(from)
          )}
          aria-hidden="true"
        >
          {getInitials(from)}
        </div>
      )}

      {/* Bubble */}
      <div className={cn('flex flex-col max-w-[80%] sm:max-w-[70%] min-w-0', isOwn ? 'items-end' : 'items-start')}>
        {showName && !isOwn && (
          <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground mb-0.5 ml-1 select-none">
            {from}
          </span>
        )}
        <div
          className={cn(
            'rounded-2xl px-3 py-2 sm:px-3.5 sm:py-2.5 text-[13px] sm:text-[13.5px] leading-[1.45] break-words',
            'transition-shadow duration-150',
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-md shadow-sm'
              : 'bg-muted rounded-bl-md',
            'hover:shadow-md active:scale-[0.98]'
          )}
        >
          <span className="whitespace-pre-wrap break-words">
            <EmojiText text={text} />
          </span>
        </div>
        <span
          className={cn(
            'text-[10px] text-muted-foreground/60 mt-0.5 mx-1 tabular-nums',
            'opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-200'
          )}
          aria-label={`Sent at ${new Date(ts).toLocaleTimeString()}`}
        >
          {new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
