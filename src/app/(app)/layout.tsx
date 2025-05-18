
'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button'; 

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <Logo />
      </header>
      <main className="flex-1 bg-background p-4 pb-24 md:p-6 md:pb-24 lg:p-8 lg:pb-24">
        {children}
      </main>
      {/* Footer now acts as a transparent positioning container */}
      <footer className="fixed inset-x-0 bottom-0 z-20 py-4 px-4 md:px-6">
        {/* Inner nav gets the background, shadow, and rounded corners */}
        <nav className="mx-auto flex max-w-md items-center justify-around gap-2 rounded-full border bg-background p-2 shadow-lg md:max-w-lg md:gap-3 md:p-3">
          <Link href="/expenses" passHref legacyBehavior>
            <Button as="a" variant="ghost" size="sm" className="flex-1 hover:bg-secondary">
              费用
            </Button>
          </Link>
          <Link href="/overview" passHref legacyBehavior>
            <Button as="a" variant="ghost" size="sm" className="flex-1 hover:bg-secondary">
              月度概览
            </Button>
          </Link>
           <Link href="/budget" passHref legacyBehavior>
            <Button as="a" variant="ghost" size="sm" className="flex-1 hover:bg-secondary">
              预算
            </Button>
          </Link>
          <Link href="/breakdown" passHref legacyBehavior>
            <Button as="a" variant="ghost" size="sm" className="flex-1 hover:bg-secondary">
              支出明细
            </Button>
          </Link>
        </nav>
      </footer>
    </div>
  );
}
