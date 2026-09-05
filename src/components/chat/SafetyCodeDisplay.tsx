'use client';

import { useEffect, useState } from 'react';
import { deriveSafetyCode } from '@/lib/crypto';
import { getIdentity } from '@/lib/chat-db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  contactPublicKey: string;
}

export function SafetyCodeDisplay({ contactPublicKey }: Props) {
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const identity = await getIdentity();
      if (!identity) return;
      const c = await deriveSafetyCode(identity.publicKey, contactPublicKey);
      setCode(c);
    })();
  }, [contactPublicKey]);

  if (!code) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Safety Code</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-1 text-3xl font-mono tracking-widest">
          {code.split('').map((char, i) => (
            <span key={i} className="bg-muted px-2 py-1 rounded">
              {char}
            </span>
          ))}
        </div>
        <p className="text-muted-foreground text-sm mt-3 text-center">
          Ask your contact to confirm this code verbally (phone call or in person).
        </p>
      </CardContent>
    </Card>
  );
}
