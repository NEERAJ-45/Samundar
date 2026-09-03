'use client';

import { useEffect, useState } from 'react';
import { getIdentity } from '@/lib/chat-db';
import { SetupWizard } from '@/components/chat/SetupWizard';
import { AddContactDialog } from '@/components/chat/AddContactDialog';
import { ContactList } from '@/components/chat/ContactList';
import { ChatThread } from '@/components/chat/ChatThread';
import { QRCodeDisplay } from '@/components/chat/QRCodeDisplay';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';

export default function ChatPage() {
  const [ready, setReady] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    getIdentity().then((id) => setReady(!!id));
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-full">
        <SetupWizard onComplete={() => setReady(true)} />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex flex-col">
        <div className="p-3 border-b flex items-center justify-between">
          <h2 className="font-semibold text-sm">E2EE Chat</h2>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowQR(!showQR)}
              title="Show QR code"
            >
              <QrCode className="h-4 w-4" />
            </Button>
            <AddContactDialog onContactAdded={() => {}} />
          </div>
        </div>
        {showQR && (
          <div className="p-3 border-b">
            <QRCodeDisplay />
          </div>
        )}
        <ContactList
          selectedContact={selectedContact}
          onSelect={setSelectedContact}
        />
      </div>

      <div className="flex-1">
        {selectedContact ? (
          <ChatThread contactUserId={selectedContact} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a contact to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
