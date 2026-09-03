'use client';

import { useEffect, useRef, useCallback } from 'react';
import { startPolling, stopPolling, type SyncCallbacks } from '@/lib/sync';
import { useQueryClient } from '@tanstack/react-query';

export function ChatPollingProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const callbacksRef = useRef<SyncCallbacks>({
    onMessage: () => {},
    onIntegrityError: () => {},
    onError: () => {},
  });

  const handleNewMessage = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
  }, [queryClient]);

  useEffect(() => {
    callbacksRef.current.onMessage = handleNewMessage;
    startPolling(callbacksRef.current, 2500);
    return () => stopPolling();
  }, [handleNewMessage]);

  return <>{children}</>;
}
