import { heroImages } from '../image-assets';

export type BlogEntry = {
  title: string;
  summary: string;
  href: string;
  label: string;
};

export const blogPageContent = {
  seoDescription: 'Writing on software architecture, systems thinking, design decisions, and creative engineering.',
  hero: {
    kicker: 'Writing and notes',
    title: 'Blog',
    description:
      'Long-form notes on architecture decisions, systems thinking, creative engineering, and practical delivery lessons.',
    image: heroImages.controlRoom,
    sectionId: 'blog-hero',
    sectionLabel: 'Blog Hero',
  },
  latestEntriesHeading: 'Latest Entries',
  entries: [
    {
      title: 'Building ngxos as progressive enhancement',
      summary: 'Why the runtime layer stays optional and how semantic Astro pages remain the source of truth.',
      href: '/portfolio/',
      label: 'Related work',
    },
    {
      title: 'Architecture notes from map and platform projects',
      summary:
        'A practical record of decisions from geospatial SDKs, platform migrations, and product delivery work.',
      href: '/portfolio/',
      label: 'Portfolio archive',
    },
    {
      title: 'Creative engineering and personal workflows',
      summary:
        'Reflections on balancing experimentation, performance, and maintainability in personal systems.',
      href: '/',
      label: 'About me',
    },
  ] as BlogEntry[],
};
