import { heroImages } from '../image-assets';

export type PortfolioCategoryKey =
  | 'professional-platforms'
  | 'mapping-gis-3d'
  | 'web-platforms'
  | 'games'
  | 'experiments';

export const portfolioPageContent = {
  seoDescription:
    'Categorized portfolio across client platforms, mapping systems, web products, games, and technical experiments by Nour Gaser.',
  hero: {
    kicker: 'Selected work',
    title: 'Portfolio',
    description:
      'A growing archive of games, software projects, prototypes, and technical experiments.',
    image: heroImages.spaceship,
    sectionId: 'portfolio-hero',
    sectionLabel: 'Portfolio Hero',
  },
};

export const portfolioCategoryOrder: PortfolioCategoryKey[] = [
  'professional-platforms',
  'mapping-gis-3d',
  'web-platforms',
  'games',
  'experiments',
];

export const portfolioCategoryMeta: Record<PortfolioCategoryKey, { title: string; description: string }> = {
  'professional-platforms': {
    title: 'Professional Platforms',
    description: 'Client-facing systems, multi-service platforms, and architecture-heavy product delivery.',
  },
  'mapping-gis-3d': {
    title: 'Mapping, GIS & 3D',
    description: 'Indoor map services, 3D SDK work, geospatial data flows, and navigation tooling.',
  },
  'web-platforms': {
    title: 'Web Platforms & Tools',
    description: 'Productivity, education, and knowledge-oriented software projects.',
  },
  games: {
    title: 'Games',
    description: 'Playable systems, mechanics R&D, and game design experiments.',
  },
  experiments: {
    title: 'Experiments',
    description: 'Focused technical studies and smaller exploratory implementations.',
  },
};

export const portfolioCategoryLabels: Record<PortfolioCategoryKey, string> = {
  'professional-platforms': 'Professional Platforms',
  'mapping-gis-3d': 'Mapping, GIS & 3D',
  'web-platforms': 'Web Platforms & Tools',
  games: 'Games',
  experiments: 'Experiments',
};
