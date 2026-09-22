'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 bg-background">
      <div className="text-8xl">🔍</div>
      
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Sahifa topilmadi
        </h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan bo'lishi mumkin.
        </p>
      </div>

      <div className="flex gap-4">
        <Link href="/">
          <Button variant="default">
            Bosh sahifaga qaytish
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline">
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
