import { cn } from '@/lib/utils';
import { Link, usePathname } from '@/i18n/routing';
import { getNavItems } from './nav-items';
import { useTranslations } from 'next-intl';

export default function DesktopNav() {
  const pathname = usePathname();
  const t = useTranslations('Nav');
  const navItems = getNavItems(t);

  return (
    <nav className="hidden max-h-fit rounded-full border border-border/70 bg-slate-50 p-1 lg:flex lg:items-center dark:bg-slate-900/40">
      {navItems.map((item) => {
        if (item.type === 'link') {
          return (
            <Link
              key={item.href}
              href={item.href as string}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 ease-in-out hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50',
                {
                  'bg-slate-100 text-slate-900 shadow-xs dark:bg-slate-800 dark:text-slate-50':
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
