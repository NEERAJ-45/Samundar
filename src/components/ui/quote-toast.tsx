'use client';

import { useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { quotes } from '../../../quotes';

export function QuoteToast() {
  useEffect(() => {
    const showQuote = () => {
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'toast-enter' : 'toast-exit'
            } flex items-start gap-2 rounded-lg border border-zinc-700/50 bg-zinc-900/95 px-3 py-2.5 shadow-lg text-xs text-zinc-100`}
            style={{ minWidth: 260, maxWidth: 320 }}
          >
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
            <div className="flex-1 min-w-0">
              <div className="font-medium leading-snug">{q.text}</div>
              <div className="mt-0.5 leading-snug text-zinc-400">— {q.author}</div>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="-mr-1 -mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ),
        { duration: 5000 }
      );
    };

    const interval = setInterval(showQuote, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
