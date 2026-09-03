'use client';

import { useEffect, useState } from 'react';
import { getContacts, type Contact } from '@/lib/chat-db';
import { cn } from '@/lib/utils';
import { Shield, ShieldAlert } from 'lucide-react';

interface Props {
  selectedContact: string | null;
  onSelect: (userId: string) => void;
}

export function ContactList({ selectedContact, onSelect }: Props) {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    getContacts().then(setContacts);
  }, []);

  return (
    <div className="w-64 border-r h-full overflow-y-auto">
      <div className="p-3 border-b">
        <h2 className="font-semibold text-sm">Contacts</h2>
      </div>
      {contacts.length === 0 && (
        <p className="p-3 text-muted-foreground text-sm">No contacts yet.</p>
      )}
      {contacts.map((c) => (
        <button
          key={c.userId}
          onClick={() => onSelect(c.userId)}
          className={cn(
            'w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-muted transition-colors',
            selectedContact === c.userId && 'bg-muted'
          )}
        >
          {c.safetyCodeVerified ? (
            <Shield className="h-4 w-4 text-green-500 shrink-0" />
          ) : (
            <ShieldAlert className="h-4 w-4 text-yellow-500 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{c.displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{c.userId}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
