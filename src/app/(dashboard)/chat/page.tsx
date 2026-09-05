'use client';

import { useState } from 'react';
import { ChatThread } from '@/components/chat/ChatThread';
import { useProfile } from '@/components/providers/ProfileProvider';

export default function ChatPage() {
  const { userName } = useProfile();
  const [username] = useState(userName || 'Anonymous');

  return (
    <div className="flex h-full w-full">
      <ChatThread username={username} />
    </div>
  );
}
