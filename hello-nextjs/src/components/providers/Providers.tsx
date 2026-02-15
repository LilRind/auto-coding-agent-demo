'use client';

import { Header } from '@/components/layout/Header';
import { usePathname } from 'next/navigation';

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <>
      {!isAuthPage && <Header />}
      <main className={isAuthPage ? '' : 'min-h-[calc(100vh-64px)]'}>
        {children}
      </main>
    </>
  );
}
