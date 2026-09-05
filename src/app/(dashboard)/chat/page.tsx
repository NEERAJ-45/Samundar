'use client';

import { useState } from 'react';
import { ChatThread } from '@/components/chat/ChatThread';
import { useProfile } from '@/components/providers/ProfileProvider';

export default function ChatPage() {
  const { userName } = useProfile();
  const [username] = useState(userName || 'Anonymous');

  return (
    <div className="flex flex-col h-full w-full min-h-0">
      <ChatThread username={username} />
    </div>
  );
}
