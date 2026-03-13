'use client';
import { Link, usePathname } from '@/i18n/routing';
import { getNavItems } from './nav-items';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './language-switcher';

interface MobileMenuProps {
  isOpen: boolean;
}

export default function MainMobileNav({ isOpen }: MobileMenuProps) {
  const pathname = usePathname();
  const t = useTranslations('Nav');
  const navItems = getNavItems(t);

  if (!isOpen) return null;

  return (
    <div className="absolute top-full z-40 h-screen w-full animate-slide-up border-b border-border bg-surface lg:hidden">
      <div className="flex flex-col justify-between">
        <div className="flex-1 overflow-y-auto">
          <div className="pt-2 pb-3 space-y-1 px-4 sm:px-6">
            {navItems.map((item) => {
              if (item.type === 'link') {
                return (
                  <Link
                    key={item.href}
                    href={item.href as string}
                    className={cn(
                      'flex h-11 items-center rounded-[var(--radius-sm)] px-3 text-sm font-medium text-slate-700 transition-colors duration-200 ease-in-out hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-slate-200 dark:hover:bg-slate-800',
                      {
                        'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50':
                          pathname === item.href,
                      }
                    )}
                  >
                    {item.label as string}
                  </Link>
                );
              }
            })}
          </div>
        </div>

        <div className="flex flex-col pt-2 pb-3 space-y-3 px-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Language</span>
            <LanguageSwitcher />
          </div>

          <Link
            href="/signin"
            className="inline-flex h-11 w-full items-center justify-center rounded-[var(--radius-md)] border border-border px-5 text-center text-sm font-medium text-slate-700 transition-colors duration-200 ease-in-out hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t('signin')}
          </Link>

          <Link
            href="/signup"
            className="inline-flex h-11 w-full items-center justify-center rounded-[var(--radius-md)] bg-primary px-5 text-sm font-semibold text-white transition-colors duration-200 ease-in-out hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('get_started')}
          </Link>
        </div>
      </div>
    </div>
  );
}
