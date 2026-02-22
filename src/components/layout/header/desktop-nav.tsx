import { cn } from '@/lib/utils';
import { Link, usePathname } from '@/i18n/routing';
import { getNavItems } from './nav-items';
import { useTranslations } from 'next-intl';

export default function DesktopNav() {
  const pathname = usePathname();
  const t = useTranslations('Nav');
  const navItems = getNavItems(t);

  return (
    <nav className="hidden lg:flex lg:items-center bg-[#F9FAFB] dark:bg-white/3 rounded-full p-1 max-h-fit">
      {navItems.map((item) => {
        if (item.type === 'link') {
          return (
            <Link
              key={item.href}
              href={item.href as string}
              className={cn(
                'text-gray-500 dark:text-gray-400 text-sm px-4 py-1.5 rounded-full hover:text-primary-500 font-medium',
                {
                  'bg-white dark:bg-white/5 font-medium text-gray-800 dark:text-white/90 shadow-xs':
                    pathname === item.href,
                }
              )}
            >
              {item.label as string}
            </Link>
          );
        }
      })}
    </nav>
  );
}
