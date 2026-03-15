export type SiteNavLink = {
  href: string;
  label: string;
};

export type SiteSocialLink = {
  href: string;
  label: string;
  icon: 'facebook' | 'github' | 'linkedin';
};

export const siteShellContent = {
  navLinks: [
    { href: '/', label: 'about' },
    { href: '/blog', label: 'blog' },
    { href: '/portfolio', label: 'portfolio' },
    { href: '/skills', label: 'skills' },
    { href: '/hobbies', label: 'hobbies' },
    { href: '/business', label: 'business' },
    { href: '/resume', label: 'resume' },
  ] as SiteNavLink[],
  footer: {
    poweredBy: 'Powered by ngxos',
    credit: 'Made with \u2665 by Nour Gaser Algendi.',
    copyrightOwner: 'Nour Gaser',
    socialHandle: '/nourgaser',
    socialLinks: [
      { href: 'https://facebook.com/nourgaser', label: 'Facebook', icon: 'facebook' },
      { href: 'https://github.com/nourgaser', label: 'GitHub', icon: 'github' },
      { href: 'https://linkedin.com/in/nourgaser', label: 'LinkedIn', icon: 'linkedin' },
    ] as SiteSocialLink[],
  },
};
