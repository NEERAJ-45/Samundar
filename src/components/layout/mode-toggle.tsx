'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { useModeStore } from '@/lib/stores/mode-store';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export function ModeToggle() {
  const { mode, toggleMode, setMode } = useModeStore();

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setMode('HOME')}
        className={cn(
          'text-xs font-medium transition-colors',
          mode === 'HOME'
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        HOME
      </button>
      <Switch
        checked={mode === 'OFFICE'}
        onCheckedChange={toggleMode}
      />
      <button
        onClick={() => setMode('OFFICE')}
        className={cn(
          'text-xs font-medium transition-colors',
          mode === 'OFFICE'
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        OFFICE
      </button>
      {mode === 'HOME' && (
        <button className="ml-1 inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="sr-only">Sync</span>
        </button>
      )}
    </div>
  );
}
