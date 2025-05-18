
import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google'; // Using Inter as a clean sans-serif
import './globals.css';
import { cn } from '@/lib/utils';
import { ExpenseProvider } from '@/context/expense-context';
import { Toaster } from "@/components/ui/toaster"; // Ensure Toaster is imported

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-geist-sans', // Keep consistent with existing var name, or update globals.css if changing
});


export const metadata: Metadata = {
  title: 'Mingan Zhang - 费用追踪器',
  description: '一个简约的应用程序，用于跟踪您的日常开支。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#5994D7" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="记账" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <ExpenseProvider>
          {children}
          <Toaster />
        </ExpenseProvider>
      </body>
    </html>
  );
}
