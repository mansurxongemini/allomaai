// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getNavItems = (t: any): NavItem[] => [
  {
    type: 'link',
    href: '/#features',
    label: t('platform'),
  },
  {
    type: 'link',
    label: t('methodology'),
    href: '/#metodika',
  },
  {
    type: 'link',
    label: t('pricing'),
    href: '/pricing',
  },
];

type NavItem = Record<string, string | unknown> &
  (
    | {
      type: 'link';
      href: string;
    }
    | {
      type: 'dropdown';
    }
  );
