'use client';

import * as React from 'react';

export default function BookSlider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
      {children}
    </div>
  );
}
