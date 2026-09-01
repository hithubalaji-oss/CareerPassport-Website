/**
 * The three pages of the site, in nav order. Header, mobile drawer and footer all read
 * this one list, so a route change cannot leave two of them disagreeing.
 */
export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { href: '/', label: 'For individuals' },
  { href: '/for-companies', label: 'For companies' },
  { href: '/for-recruitment-partners', label: 'For recruitment partners' },
];

/** True when `href` is the page currently being rendered. */
export const isCurrent = (href: string, pathname: string): boolean =>
  href === '/' ? pathname === '/' : pathname.replace(/\/$/, '') === href;
