'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 bg-background">
          <div className="text-8xl">😵</div>
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Kutilmagan xatolik
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Iltimos, qayta urinib ko'ring yoki sahifani yangilang.
            </p>
          </div>

          {error.digest && (
            <div className="rounded-lg bg-muted p-4 max-w-md w-full">
              <p className="text-xs text-muted-foreground font-mono break-all">
                Error ID: {error.digest}
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <Button onClick={reset} variant="default">
              Qayta urinish
            </Button>
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="outline"
            >
              Bosh sahifaga qaytish
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
