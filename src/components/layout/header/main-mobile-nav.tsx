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
    <div className="lg:hidden h-screen absolute top-full bg-white dark:bg-dark-primary w-full border-b border-gray-200 dark:border-gray-800">
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
                      'block px-3 py-2 rounded-md text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
                      {
                        'text-gray-800 dark:text-white': pathname === item.href,
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
            className="text-sm block w-full border h-11 border-gray-200 px-5 py-3 rounded-full text-center font-medium text-gray-700 dark:text-gray-400 hover:text-primary-500"
          >
            {t('signin')}
          </Link>

          <Link
            href="/signup"
            className="flex items-center px-5 py-3 gradient-btn justify-center text-sm text-white rounded-full button-bg h-11"
          >
            {t('get_started')}
          </Link>
        </div>
      </div>
    </div>
  );
}
