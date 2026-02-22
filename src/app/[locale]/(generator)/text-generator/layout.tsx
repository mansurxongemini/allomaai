import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

export const metadata: Metadata = {
  title: 'Text Generator',
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <main className="flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex-[1_1_0]">
        <div className="relative flex flex-col h-full isolate">{children}</div>
      </div>
    </main>
  );
}
