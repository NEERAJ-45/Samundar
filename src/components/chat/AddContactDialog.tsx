'use client';

import { useState } from 'react';
import { addContact, type Contact } from '@/lib/chat-db';
import { deriveSafetyCode } from '@/lib/crypto';
import { getIdentity } from '@/lib/chat-db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

interface Props {
  onContactAdded: (contact: Contact) => void;
}

export function AddContactDialog({ onContactAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [safetyCode, setSafetyCode] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [step, setStep] = useState<'input' | 'verify' | 'done'>('input');

  const handleLookup = async () => {
    try {
      const res = await fetch(`/api/chat/keys?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) {
        alert('User not found on the relay');
        return;
      }
      const data = await res.json();
      setPublicKey(data.publicKey);
      const identity = await getIdentity();
      if (!identity) return;
      const code = await deriveSafetyCode(identity.publicKey, data.publicKey);
      setSafetyCode(code);
      setStep('verify');
    } catch {
      alert('Failed to look up user');
    }
  };

  const handleSave = async () => {
    const contact: Contact = {
      userId,
      publicKey,
      displayName: displayName || userId,
      safetyCodeVerified: verified,
      addedAt: Date.now(),
    };
    await addContact(contact);
    onContactAdded(contact);
    setOpen(false);
    setStep('input');
    setUserId('');
    setPublicKey('');
    setDisplayName('');
    setSafetyCode(null);
    setVerified(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Contact
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Contact</DialogTitle>
          <DialogDescription>
            Enter the contact&apos;s user ID to look up their public key.
          </DialogDescription>
        </DialogHeader>

        {step === 'input' && (
          <div className="space-y-3">
            <Input
              placeholder="Contact's User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <Input
              placeholder="Display name (optional)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <Button onClick={handleLookup} disabled={!userId.trim()} className="w-full">
              Look Up Key
            </Button>
          </div>
        )}

        {step === 'verify' && safetyCode && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Verify this safety code with your contact:
            </p>
            <div className="flex items-center justify-center gap-1 text-2xl font-mono tracking-widest">
              {safetyCode.split('').map((char, i) => (
                <span key={i} className="bg-muted px-2 py-1 rounded">{char}</span>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
              />
              Code verified verbally
            </label>
            <Button onClick={handleSave} className="w-full">
              Save Contact
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
