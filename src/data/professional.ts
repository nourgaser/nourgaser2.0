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

export const professionalSummary = {
  headline: 'Software Engineer | Game Designer | Academic',
  blurb:
    'Software engineer with a systems-first mindset across architecture, product platforms, and geospatial/3D map systems. Co-Founder of ANY Solutions, currently pursuing an MSc in Computer Science and serving as a Teaching Assistant at GIU.',
  businessName: 'ANY Solutions',
  businessDescription:
    'ANY Solutions is an Egypt-based software house I co-founded to provide end-to-end technical consultancy and development for business clients. Still early-stage — a small founding team handling a handful of client engagements directly, with big potential and room to grow.',
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
    role: 'Co-Founder',
    organization: 'ANY Solutions',
    period: 'Mar 2024 - Present',
    notes:
      'Co-founded and lead technical delivery — architecture, infrastructure, and hands-on development across client engagements, including Safaria (our first client) and outsourced work for Genesis Creations.',
  },
  {
    role: 'Teaching Assistant',
    organization: 'German International University (GIU)',
    period: 'Sep 2025 - Present',
    notes:
      'Electronic Business Development, Python Programming, and other computer-science-related courses for the Business Informatics program.',
  },
  {
    role: 'Software Engineer',
    organization: 'Genesis Creations S.A.E',
    period: 'Oct 2024 - Jan 2025',
    notes: "An on-off collaboration which started as a full-time software engineering position where I worked on web development projects, then moved on to outsourced projects that I handled for them externally."
  },
  {
    role: 'Software Engineer',
    organization: 'Hoopoe Digital',
    period: 'Nov 2023 - Aug 2025',
    notes: 'Two separate engineering roles, plus an earlier internship there in 2022. This is where I learned all my foundational software engineering skills; roles at Hoopoe Digital shaped my current wide range of skills and set me up for software engineering success.',
  },
];

export const earlierCareerNote =
  'Earlier: Software Support Engineer at Bosta, a software engineering training program with Manara, and STEM instruction with iSchool (2022-2023).';

export const education: EducationEntry[] = [
  {
    degree: 'Master of Science (MS), Computer Science (Major: Media Informatics)',
    institution: 'German International University (GIU)',
    period: 'Sep 2025 - Present',
    details:
      'Research interests: media informatics, HCI, AI regulation and ethical use (augmentation vs. atrophy), and learning science. Thesis direction not yet finalized.',
  },
  {
    degree: 'Bachelor of Science (BS), Computer Science',
    institution: 'Misr University for Science and Technology',
    period: 'Sep 2019 - Jul 2023',
    details: 'Grade: 3.9/4.0, ranked 6th in class.',
  },
];
