'use client';
import { CloseIcon, MenuIcon } from '@/icons/icons';
import Image from 'next/image';
import { Link, usePathname } from '@/i18n/routing';
import { useEffect, useState } from 'react';
import DesktopNav from './desktop-nav';
import MainMobileNav from './main-mobile-nav';
import ThemeToggle from './theme-toggle';
import LanguageSwitcher from './language-switcher';
import { useTranslations } from 'next-intl';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('Nav');

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-surface/90 py-2 backdrop-blur-md lg:py-4">
      <div className="px-4 sm:px-6 lg:px-7">
        <div className="grid grid-cols-2 items-center lg:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center">
            <Link href="/" className="flex items-end gap-2">
              <Image
                src="/images/logo-black.svg"
                className="block dark:hidden"
                style={{ width: 'auto', height: 'auto' }}
                alt="ALLOMA AI Logo"
                width={180}
                height={30}
              />

              <Image
                src="/images/logo-white.svg"
                className="hidden dark:block"
                style={{ width: 'auto', height: 'auto' }}
                alt="ALLOMA AI Logo"
                width={180}
                height={30}
              />

            </Link>
          </div>

          <DesktopNav />

          <div className="flex items-center gap-4 justify-self-end">
            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>

            <ThemeToggle />

            <button
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              type="button"
              className="order-last shrink-0 inline-flex items-center justify-center rounded-[var(--radius-sm)] p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 lg:hidden"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            <Link
              href="/signin"
              className="text-sm hidden lg:block font-medium text-gray-700 dark:text-gray-400 hover:text-primary-500"
            >
              {t('signin')}
            </Link>

            <Link
              href="/signup"
              className="lg:inline-flex items-center px-5 py-3 gradient-btn hidden text-sm text-white rounded-full button-bg h-11"
            >
              {t('get_started')}
            </Link>
          </div>
        </div>
      </div>

      <MainMobileNav isOpen={mobileMenuOpen} />
    </header>
  );
}
