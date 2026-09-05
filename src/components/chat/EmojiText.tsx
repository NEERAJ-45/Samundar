import { useEffect, useRef } from 'react';
import twemoji from 'twemoji';

interface Props {
  text: string;
  className?: string;
}

export function EmojiText({ text, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = twemoji.parse(text, {
        folder: 'svg',
        ext: '.svg',
        base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/',
      });
    }
  }, [text]);

  return (
    <span
      ref={ref}
      className={className}
      style={{ lineHeight: '1.4' }}
    />
  );
}
