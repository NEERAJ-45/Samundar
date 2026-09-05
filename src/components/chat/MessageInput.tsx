'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Smile, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const EMOJI_CATEGORIES = {
  'Smileys': ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','😐','😑','😏','😒','🙄','😬','😌','😔','😪','😴','😷','🤒','🤕','🤢','🤮','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐'],
  'Gestures': ['👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏'],
  'Hearts': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟'],
  'Objects': ['🔥','⭐','🌟','✨','💫','🎉','🎊','🎯','🏆','💎','💡','📌','📍','🔔','🎵','🎶','📱','💻','🖥️','📷','📸','🎮','🎨','📚','📖','✏️','📝'],
  'Food': ['☕','🍵','🥤','🍺','🍻','🥂','🍷','🍸','🍹','🧃','🍔','🍕','🌮','🍜','🍣','🍰','🎂','🍩','🍪','🍫','🍬'],
};

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  const closeEmoji = useCallback(() => setShowEmoji(false), []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        closeEmoji();
      }
    }
    if (showEmoji) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showEmoji, closeEmoji]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
    inputRef.current?.focus();
  };

  const insertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  function twemojiSrc(emoji: string): string {
    const codePoints: number[] = [];
    for (const char of emoji) {
      const cp = char.codePointAt(0);
      if (cp) codePoints.push(cp);
    }
    const hex = codePoints
      .filter((cp) => cp !== 0xfe0f)
      .map((cp) => cp.toString(16))
      .join('-');
    return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${hex}.svg`;
  }

  return (
    <div className="bg-background/80 backdrop-blur-sm px-2.5 py-2 sm:px-4 sm:py-3">
      {/* Emoji Picker — max height for mobile, scrollable */}
      {showEmoji && (
        <div
          ref={emojiRef}
          className="mb-2 bg-muted/40 rounded-xl border border-border/50 p-2.5 sm:p-3 max-h-[40vh] sm:max-h-48 overflow-y-auto overscroll-contain"
          role="dialog"
          aria-label="Emoji picker"
        >
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Emoji
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-6 sm:w-6 rounded-full cursor-pointer"
              onClick={closeEmoji}
              aria-label="Close emoji picker"
            >
              <X className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
            </Button>
          </div>
          {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
            <div key={category} className="mb-2 last:mb-0">
              <p className="text-[10px] font-medium text-muted-foreground/70 mb-1 px-1 uppercase tracking-widest">
                {category}
              </p>
              <div className="flex flex-wrap gap-0.5">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => insertEmoji(emoji)}
                    className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-background/60 active:scale-90 rounded-lg transition-all duration-150 cursor-pointer"
                    aria-label={`Insert ${emoji}`}
                  >
                    <img
                      draggable={false}
                      alt=""
                      className="w-5 h-5 pointer-events-none"
                      src={twemojiSrc(emoji)}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input Row — 44px min touch targets */}
      <div className="flex items-end gap-1.5 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowEmoji(!showEmoji)}
          className={cn(
            'shrink-0 h-11 w-11 sm:h-10 sm:w-10 rounded-full cursor-pointer transition-colors duration-150',
            showEmoji ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label={showEmoji ? 'Close emoji picker' : 'Open emoji picker'}
          aria-expanded={showEmoji}
        >
          <Smile className="h-5 w-5" />
        </Button>

        <div className="flex-1 relative min-w-0">
          <label htmlFor="chat-input" className="sr-only">
            Type a message
          </label>
          <input
            ref={inputRef}
            id="chat-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
            placeholder="Type a message..."
            disabled={disabled}
            autoComplete="off"
            autoCorrect="on"
            autoCapitalize="sentences"
            className={cn(
              'w-full h-11 sm:h-10 rounded-full px-4 text-[14px] sm:text-[13.5px]',
              'bg-muted/50 border border-transparent',
              'placeholder:text-muted-foreground/50',
              'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50',
              'transition-all duration-150',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!text.trim() || disabled}
          size="icon"
          className={cn(
            'shrink-0 h-11 w-11 sm:h-10 sm:w-10 rounded-full cursor-pointer transition-all duration-200',
            text.trim()
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm scale-100'
              : 'bg-muted text-muted-foreground scale-[0.92]'
          )}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
