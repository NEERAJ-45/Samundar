'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface LazyAppearProps {
  children: React.ReactNode;
  className?: string;
  placeholder?: React.ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
}

export function LazyAppear({
  children,
  className,
  placeholder,
  delay = 0,
  duration = 0.5,
  yOffset = 15,
}: LazyAppearProps) {
  const ref = useRef<HTMLDivElement>(null);
  // useInView from framer-motion is highly optimized for checking viewport visibility
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const [hasRendered, setHasRendered] = useState(false);

  useEffect(() => {
    if (isInView && !hasRendered) {
      setHasRendered(true);
    }
  }, [isInView, hasRendered]);

  return (
    <div ref={ref} className={className}>
      {hasRendered ? (
        <motion.div
          initial={{ opacity: 0, y: yOffset }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration, delay, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      ) : (
        placeholder || (
          <div className="w-full h-32 rounded-xl border border-zinc-800/50 bg-zinc-900/20 animate-pulse flex items-center justify-center">
            <div className="h-4 w-1/3 bg-zinc-800/50 rounded" />
          </div>
        )
      )}
    </div>
  );
}
