export type ExpertiseArea = {
  title: string;
  description: string;
};

export type ExperienceEntry = {
  role: string;
  organization: string;
  period: string;
  location?: string;
  notes?: string;
};

export type EducationEntry = {
  degree: string;
  institution: string;
  period: string;
  details?: string;
};

export type FeaturedWork = {
  title: string;
  description: string;
  category?: string;
  url?: string;
};

export const professionalSummary = {
  headline: 'Software Engineer | MSc Student',
  blurb:
    'Software engineer with a systems-first mindset across architecture, product platforms, and geospatial/3D map systems. Co-founder of an independent consultancy, currently pursuing an MSc in Computer Science and serving as a Teaching Assistant.',
  businessName: 'Independent Technical Consultancy',
  businessDescription:
    'Egypt-based software house co-founded to provide end-to-end technical consultancy and development, delivering holistic A-Z solutions for business clients.',
};

export const coreExpertise: ExpertiseArea[] = [
  {
    title: 'Infrastructure & Architecture',
    description:
      'Designing resilient cloud environments, network configurations, containerized deployments, and production-ready service boundaries.',
  },
  {
    title: 'Platform Engineering',
    description:
      'Building full software ecosystems across backend APIs, admin tooling, customer surfaces, and supporting data layers.',
  },
  {
    title: 'Geospatial & 3D Systems',
    description:
      'Developing map-centric systems, indoor navigation workflows, and reusable 3D SDK capabilities for production applications.',
  },
  {
    title: 'Systems & Workflow Optimization',
    description:
      'Improving developer and business workflows using Linux-driven tooling, automation, and self-hosted services.',
  },
];

export const experience: ExperienceEntry[] = [
  {
    role: 'Teaching Assistant',
    organization: 'University Computer Science Department',
    period: 'Sep 2025 - Present',
    location: 'Cairo, Egypt (On-site)',
  },
  {
    role: 'Co-Founder',
    organization: 'Independent Technical Consultancy',
    period: 'Mar 2024 - Present',
  },
  {
    role: 'Software Engineer',
    organization: 'Digital Product Company',
    period: 'Jan 2025 - Aug 2025',
  },
  {
    role: 'Software Engineer',
    organization: 'Enterprise Commerce Engineering Team',
    period: 'Oct 2024 - Jan 2025',
  },
  {
    role: 'Software Engineer',
    organization: 'Digital Product Company',
    period: 'Nov 2023 - Oct 2024',
  },
  {
    role: 'Software Support Engineer',
    organization: 'Logistics Technology Company',
    period: 'Sep 2023 - Nov 2023',
    location: 'Cairo, Egypt (Hybrid)',
  },
  {
    role: 'Software Engineering Trainee',
    organization: 'Engineering Training Program',
    period: 'May 2023 - Jul 2023',
    notes:
      'Self-paced interview-preparation training focused on algorithms, clean code, debugging, communication, and mentorship.',
  },
  {
    role: 'Software Programming Instructor',
    organization: 'STEM Education Platform',
    period: 'May 2023 - Jun 2023',
  },
  {
    role: 'Software Development Intern',
    organization: 'Digital Product Company',
    period: 'Jul 2022 - Sep 2022',
  },
];

export const education: EducationEntry[] = [
  {
    degree: 'Master of Science (MS), Computer Science',
    institution: 'German International University (GIU)',
    period: 'Sep 2025 - Present',
  },
  {
    degree: 'Bachelor of Science (BS), Computer Science',
    institution: 'Misr University for Science and Technology',
    period: 'Sep 2019 - Jul 2023',
    details: 'Grade: 3.9/4.0, ranked 6th in class.',
  },
];

export const featuredProfessionalWork: FeaturedWork[] = [
  {
    title: 'Commerce Migration Ecosystem',
    category: 'Professional Platform',
    description:
      'Commerce-focused migration and synchronization pipelines, product/catalog normalization, and operational job tooling at scale.',
  },
  {
    title: 'Travel Platform Suite',
    category: 'Professional Platform',
    description:
      'Multi-repo travel platform spanning API architecture, tenant bootstrap flows, and operator-facing admin surfaces on Bun-based workflows.',
  },
  {
    title: 'Map Core SDK + 3D Map Platform',
    category: 'Mapping / GIS / 3D',
    description:
      'Reusable Three.js map SDK and indoor mapping backend/editor stack with GeoJSON, style/group systems, and 3D model support.',
  },
  {
    title: 'Healthcare Platform',
    category: 'Professional Platform',
    description:
      'Healthcare-domain engineering delivered with confidentiality constraints, focused on maintainable architecture and operational robustness.',
  },
  {
    title: 'Technical Consultancy Practice',
    category: 'Consultancy',
    description: 'End-to-end technical consultancy and custom software delivery for business clients across multiple domains.',
  },
];

export const currentProjectNotes: string[] = [
  'Expanding categorized portfolio coverage for client platforms, mapping systems, and architecture-heavy engagements.',
  'Iterating on map-centric tooling and reusable geospatial workflows across backend and SDK boundaries.',
  'Continuing parallel R&D in learning/productivity tooling and game systems as long-term personal tracks.',
];
