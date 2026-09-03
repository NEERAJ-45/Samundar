import { ChatPollingProvider } from '@/components/chat/ChatPollingProvider';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatPollingProvider>
      <div className="flex h-full">
        {children}
      </div>
    </ChatPollingProvider>
  );
}
