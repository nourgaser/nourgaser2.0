export type SkillCategory = {
  name: string;
  items: string[];
};

// Curated from LinkedIn profile data and existing portfolio evidence.
export const skillCategories: SkillCategory[] = [
  {
    name: 'Core Engineering',
    items: [
      'Software Architecture',
      'Full-Stack Web Development',
      'Cross-Platform Product Development',
      'Game Development',
      'Cloud Infrastructure',
      'Linux System Administration',
      'Network Administration',
      'Secure Authentication & Authorization',
    ],
  },
  {
    name: 'Languages & Frameworks',
    items: [
      'TypeScript',
      'JavaScript / Node.js',
      'Python',
      'C++',
      'C',
      'SQL',
      'React',
      'Express.js',
      'Django',
      'Unity / C#',
    ],
  },
  {
    name: 'Data & Infrastructure Tools',
    items: [
      'PostgreSQL',
      'MongoDB',
      'NoSQL Systems',
      'Nginx',
      'Google Cloud Platform (GCP)',
      'FreeRADIUS',
      'Git',
      'Docker & Containerized Workflows',
      'Self-Hosted Services',
    ],
  },
  {
    name: 'Game & Creative Tech',
    items: [
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
  {
    name: 'Professional Skills',
    items: [
      'Technical Mentorship & Teaching',
      'Cross-Functional Collaboration',
      'Technical Communication',
      'Consultancy Discovery & Scoping',
      'Workflow Optimization',
    ],
  },
];
