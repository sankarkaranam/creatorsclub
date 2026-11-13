/** One place for every link, address and handle the site shows. Empty values are hidden in the UI. */
export const SITE = {
  name: 'Creators Club',
  url: 'https://creatorsclub.co.in',
  tagline: 'Connect. Collaborate. Create. Earn.',
  description:
    'Creators Club is India’s verified home for creators and brands: identity-checked creators, verified businesses, real audience numbers, campaign deals, Instagram and YouTube automation, and your own store, in one place.',
  company: 'ORUMIND',
  location: 'Hyderabad, Telangana, India',
  appUrl: 'https://app.creatorsclub.co.in',
  loginUrl: 'https://app.creatorsclub.co.in/login',
  consoleUrl: 'https://console.creatorsclub.co.in',
  /** Business contact address. Leave empty until a real mailbox exists; the contact form is used instead. */
  email: '',
  /** Android app on Google Play. Leave empty until the listing is live. */
  playStoreUrl: '',
  social: {
    instagram: '',
    youtube: '',
    linkedin: '',
    x: '',
  },
} as const;

export const NAV = [
  { href: '/creators', label: 'For creators' },
  { href: '/brands', label: 'For brands' },
  { href: '/platform', label: 'Platform' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;
