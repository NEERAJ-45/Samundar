'use client';

import { useState } from 'react';
import { generateIdentity } from '@/lib/crypto';
import { saveIdentity, getIdentity } from '@/lib/chat-db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useProfile } from '@/components/providers/ProfileProvider';

interface Props {
  onComplete: () => void;
}

export function SetupWizard({ onComplete }: Props) {
  const { userEmail } = useProfile();
  const [step, setStep] = useState<'input' | 'generating' | 'done'>('input');
  const [userId, setUserId] = useState(userEmail ?? '');

  const handleGenerate = async () => {
    if (!userId.trim()) return;
    setStep('generating');
    try {
      const existing = await getIdentity();
      if (existing) {
        onComplete();
        return;
      }
      const identity = await generateIdentity(userId.trim());
      await saveIdentity(identity);

      await fetch('/api/chat/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: identity.userId, publicKey: identity.publicKey }),
      });

      setStep('done');
      onComplete();
    } catch (error) {
      console.error('Setup failed:', error);
      setStep('input');
    }
  };

  if (step === 'generating') {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">Generating encryption keys...</p>
        </CardContent>
      </Card>
    );
  }

  if (step === 'done') {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Keys generated. You can now add contacts.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Up Encrypted Chat</CardTitle>
        <CardDescription>
          Generate your encryption keys. Your private key never leaves this device.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Your User ID</label>
          <Input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="e.g. neeraj@family"
          />
        </div>
        <Button onClick={handleGenerate} disabled={!userId.trim()} className="w-full">
          Generate Keys
        </Button>
      </CardContent>
    </Card>
  );
}
