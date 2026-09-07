/**
 * The site's routes, declared once. Header, mobile drawer and footer all read this, so a
 * route change cannot leave two of them disagreeing.
 *
 * The 8 Sep design splits them: the header carries only the two interior pages (the brand
 * lockup is the way home), while the footer lists all three plus Blogs.
 */
export interface NavLink {
  href: string;
  label: string;
}

/** The two interior pages — the header nav and the mobile drawer. */
export const NAV_LINKS: readonly NavLink[] = [
  { href: '/for-companies', label: 'For companies' },
  { href: '/for-recruitment-partners', label: 'For recruitment partners' },
];

/** The footer lists home as well, and Blogs, which has no page yet. */
export const FOOTER_LINKS: readonly NavLink[] = [
  { href: '/', label: 'Home' },
  ...NAV_LINKS,
  { href: '#', label: 'Blogs' },
];

/** True when `href` is the page currently being rendered. */
export const isCurrent = (href: string, pathname: string): boolean =>
  href === '/' ? pathname === '/' : href !== '#' && pathname.replace(/\/$/, '') === href;
