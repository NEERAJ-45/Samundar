'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  return (
    <div className="border-t bg-background p-3">
      {showEmoji && (
        <div
          ref={emojiRef}
          className="mb-3 bg-muted/50 backdrop-blur-sm rounded-xl border p-3 max-h-52 overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Emoji</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowEmoji(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
            <div key={category} className="mb-2">
              <p className="text-[10px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                {category}
              </p>
              <div className="flex flex-wrap gap-0.5">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => insertEmoji(emoji)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-background/80 rounded-lg transition-colors active:scale-90"
                  >
                    <img
                      draggable={false}
                      alt={emoji}
                      className="inline-block w-5 h-5"
                      src={`https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${twemojiCodeToHex(emoji)}.svg`}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowEmoji(!showEmoji)}
          className={cn(
            'shrink-0 h-10 w-10 rounded-full transition-colors',
            showEmoji && 'bg-muted text-foreground'
          )}
        >
          <Smile className="h-5 w-5" />
        </Button>
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
            placeholder="Type a message..."
            disabled={disabled}
            className="rounded-full h-10 px-4 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!text.trim() || disabled}
          size="icon"
          className={cn(
            'shrink-0 h-10 w-10 rounded-full transition-all',
            text.trim()
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 scale-100'
              : 'bg-muted text-muted-foreground scale-95'
          )}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function twemojiCodeToHex(emoji: string): string {
  const codePoints: number[] = [];
  for (const char of emoji) {
    const cp = char.codePointAt(0);
    if (cp) codePoints.push(cp);
  }
  return codePoints
    .filter((cp) => cp !== 0xfe0f)
    .map((cp) => cp.toString(16))
    .join('-');
}
