export type SkillCategory = {
  name: string;
  items: string[];
};

// Curated from LinkedIn profile data and repository evidence across professional projects.
export const skillCategories: SkillCategory[] = [
  {
    name: 'Platform Engineering & Delivery',
    items: [
      'API-First Platform Design',
      'Multi-Repo System Design',
      'Service Boundary Design',
      'Full-Stack Web Development',
      'Production Operations & Reliability',
      'Technical Discovery & Scoping',
    ],
  },
  {
    name: 'Backend & API Engineering',
    items: [
      'NestJS',
      'Fastify',
      'Express.js',
      'Django',
      'Prisma ORM',
      'Sequelize',
      'REST API Design',
      'OpenAPI Contract Workflows',
      'Authentication & Authorization',
      'Payment Gateway Integration',
      'Webhook Processing & Event Flows',
      'Transactional Email/SMS Integrations',
    ],
  },
  {
    name: 'E-commerce & Payments',
    items: [
      'Catalog & Product Data Modeling',
      'Cart, Checkout & Order Workflows',
      'Inventory & Pricing Synchronization',
      'Payment Provider APIs (Stripe/MyFatoorah/Tap)',
      'Payment Callback Validation & Reconciliation',
      'Merchant/Admin Commerce Tools',
      'Legacy-to-Modern Commerce Migration',
    ],
  },
  {
    name: 'Frontend & Product Interfaces',
    items: [
      'React',
      'TypeScript',
      'JavaScript / Node.js',
      'Vite',
      'Next.js',
      'Tailwind CSS',
      'i18n Localization Workflows',
      'CMS/Admin Surface Design',
    ],
  },
  {
    name: 'Geospatial, Mapping & 3D',
    items: [
      'Three.js / WebGL',
      'Map SDK Engineering',
      'Mapbox Style Ecosystem',
      'GeoJSON Data Modeling',
      'Indoor Navigation Systems',
      'GIS-Oriented Workflows',
      '3D Asset Integration',
    ],
  },
  {
    name: 'Data, DevOps & Infrastructure',
    items: [
      'PostgreSQL',
      'MySQL',
      'MongoDB',
      'Docker & Docker Compose',
      'GitLab CI/CD',
      'Linux System Administration',
      'Network Administration',
      'Nginx',
      'Cloud Infrastructure (GCP)',
      'Self-Hosted Services',
      'Cron/Job Automation Pipelines',
    ],
  },
  {
    name: 'Languages',
    items: [
      'TypeScript',
      'JavaScript',
      'Python',
      'Dart',
      'C#',
      'C++',
      'C',
      'SQL',
    ],
  },
  {
    name: 'Game & Creative Systems',
    items: [
      'Unity',
      'Game Development',
      'Game Programming',
      'Game Design',
      'Computer Graphics',
      'Pixel Art',
      'Electronics & Arduino',
      'Creative Writing',
      'Figma',
    ],
  },
  {
    name: 'Computer Science Foundations',
    items: [
      'Algorithms',
      'Data Structures',
      'Problem Solving',
      'Machine Learning',
      'x86 Assembly',
      'Mathematics for Computing',
    ],
  },
];
