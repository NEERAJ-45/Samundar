'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getIdentity } from '@/lib/chat-db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function QRCodeDisplay() {
  const [qrData, setQrData] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const identity = await getIdentity();
      if (!identity) return;
      setQrData(JSON.stringify({
        userId: identity.userId,
        publicKey: identity.publicKey,
      }));
    })();
  }, []);

  if (!qrData) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Your QR Code</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        <QRCodeSVG value={qrData} size={200} />
        <p className="text-muted-foreground text-sm text-center">
          Have someone scan this to add you as a contact.
        </p>
      </CardContent>
    </Card>
  );
}

interface ScannerProps {
  onScan?: (publicKey: string, userId: string) => void;
}

export function QRScanner({ onScan }: ScannerProps) {
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleManualAdd = () => {
    try {
      const data = JSON.parse(manualInput);
      if (!data.userId || !data.publicKey) {
        setError('Invalid QR data format');
        return;
      }
      onScan?.(data.publicKey, data.userId);
      setManualInput('');
      setError(null);
    } catch {
      setError('Invalid JSON — paste the QR code content or public key');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Add Contact</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-sm font-medium">Paste contact&apos;s public key data</label>
          <textarea
            className="w-full mt-1 p-2 border rounded text-sm min-h-[80px]"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder='{"userId":"...","publicKey":"..."}'
          />
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
      </CardContent>
    </Card>
  );
}
