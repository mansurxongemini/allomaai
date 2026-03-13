import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Inter } from 'next/font/google';
import '../globals.css';
import { ToasterProvider } from './providers/toaster';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({
  subsets: ['latin'],
});

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export const metadata: Metadata = {
  title: {
    default: 'ALLOMA AI',
    template: '%s | ALLOMA AI',
  },
  description:
    "Yurisprudensiyani yodlamang. Uni tushuning. Sun'iy intellekt va First Principles asosidagi yuridik ta'lim platformasi.",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as unknown as typeof routing.locales[number])) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`min-h-screen flex flex-col bg-[var(--bg)] text-[var(--foreground)] ${inter.className}`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider disableTransitionOnChange>
            {/* ToasterProvider must render before the children components */}
            {/* https://github.com/emilkowalski/sonner/issues/168#issuecomment-1773734618 */}
            <ToasterProvider />

            <AuthProvider>
              <div className="isolate flex flex-col flex-1">{children}</div>
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
