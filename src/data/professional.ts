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
  url?: string;
};

export const professionalSummary = {
  headline: 'Software Engineer | MSc Student',
  blurb:
    'Software engineer with a systems-first mindset across software architecture, cloud infrastructure, and cross-platform product delivery. Co-founder of ANY Solutions, currently pursuing an MSc in Computer Science and serving as a Teaching Assistant at GIU.',
  businessName: 'ANY Solutions',
  businessDescription:
    'Egypt-based software house co-founded to provide end-to-end technical consultancy and development, delivering holistic A-Z solutions for business clients.',
};

export const coreExpertise: ExpertiseArea[] = [
  {
    title: 'Infrastructure & Architecture',
    description:
      'Designing resilient cloud environments, network configurations, and automated containerization strategies.',
  },
  {
    title: 'Cross-Platform Engineering',
    description:
      'Building full software ecosystems across web, mobile, and desktop, from database architecture to user experience.',
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
    organization: 'German International University (GIU)',
    period: 'Sep 2025 - Present',
    location: 'Cairo, Egypt (On-site)',
  },
  {
    role: 'Co-Founder',
    organization: 'ANY Solutions',
    period: 'Mar 2024 - Present',
  },
  {
    role: 'Software Engineer',
    organization: 'Hoopoe Digital',
    period: 'Jan 2025 - Aug 2025',
  },
  {
    role: 'Software Engineer',
    organization: 'Genesis Creations S.A.E',
    period: 'Oct 2024 - Jan 2025',
  },
  {
    role: 'Software Engineer',
    organization: 'Hoopoe Digital',
    period: 'Nov 2023 - Oct 2024',
  },
  {
    role: 'Software Support Engineer',
    organization: 'Bosta',
    period: 'Sep 2023 - Nov 2023',
    location: 'Cairo, Egypt (Hybrid)',
  },
  {
    role: 'Software Engineering Trainee',
    organization: 'Manara',
    period: 'May 2023 - Jul 2023',
    notes:
      'Self-paced interview-preparation training focused on algorithms, clean code, debugging, communication, and mentorship.',
  },
  {
    role: 'Software Programming Instructor',
    organization: 'iSchool',
    period: 'May 2023 - Jun 2023',
  },
  {
    role: 'Software Development Intern',
    organization: 'Hoopoe Digital',
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
    title: 'ANY Solutions Technical Consultancy',
    description: 'End-to-end technical consultancy and custom software delivery for business clients.',
  },
  {
    title: 'Simpleskill',
    description: 'Self-learning platform for productivists with free time (Django).',
  },
  {
    title: 'Charged Learning',
    description: 'Puzzle video game designed to gamify learning electric circuits.',
    url: 'https://cl.nourgaser.com',
  },
  {
    title: 'nourgaser.com / ngxos',
    description: 'Personal portfolio and custom site engine with terminal-inspired interaction.',
    url: 'https://nourgaser.com/',
  },
];

export const currentProjectNotes: string[] = [
  'Skill-list generator app using machine learning and online VCS hosting APIs.',
  'Turn-based fighting game blending XCOM-style RNG, MOBA-like character systems, and card-collection loops.',
];
