'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value;
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    };

    return (
        <select
            value={locale}
            onChange={handleLanguageChange}
            disabled={isPending}
            className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-300 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 outline-none ring-primary-500 focus:ring-2 cursor-pointer"
        >
            <option value="uz" className="text-gray-900 bg-white">O&apos;zbek</option>
            <option value="ru" className="text-gray-900 bg-white">Русский</option>
            <option value="en" className="text-gray-900 bg-white">English</option>
        </select>
    );
}
