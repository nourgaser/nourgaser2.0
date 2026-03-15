export type HobbyCard = {
  headingId: string;
  sectionId: string;
  sectionLabel: string;
  title: string;
  description: string;
  points?: string[];
};

export const hobbiesPageContent = {
  seoDescription:
    'Personal interests: game design and development, learning and academia, reading and writing, and intentional digital living.',
  hero: {
    kicker: 'Life Outside Work',
    title: 'Hobbies',
    description:
      'Outside of work, most of my time goes into building, learning, and reflecting. I enjoy hobbies that are creative, technical, and meaningful over the long term.',
    image: '/hero/space3.png',
    sectionId: 'hobbies-hero',
    sectionLabel: 'Hobbies Hero',
  },
  cards: [
    {
      headingId: 'hobby-game-design',
      sectionId: 'game-design',
      sectionLabel: 'Game Design',
      title: 'Game Design, Development, and Gaming',
      description:
        'Game design is one of my favorite outlets. I enjoy designing systems, balancing mechanics, and building playful prototypes as much as shipping complete experiences.',
      points: [
        'Designing game mechanics, loops, and progression systems',
        'Building game prototypes and tools',
        'Playing games with strong systems and creative worldbuilding',
      ],
    },
    {
      headingId: 'hobby-reading-writing',
      sectionId: 'reading-writing',
      sectionLabel: 'Reading and Writing',
      title: 'Reading and Writing',
      description:
        'Reading and writing help me think clearly. I enjoy technical reading, thoughtful long-form writing, and keeping notes that turn ideas into action.',
      points: [
        'Technical articles and engineering concepts',
        'Reflective writing and idea journals',
        'Books that combine meaning, depth, and practical insight',
      ],
    },
    {
      headingId: 'hobby-learning',
      sectionId: 'learning',
      sectionLabel: 'Learning',
      title: 'Learning, Academia, and Deep Study',
      description:
        'I genuinely enjoy structured learning and academia. I like studying topics in depth and connecting theory to implementation.',
      points: [
        'Computer science foundations and systems thinking',
        'Research-driven learning and long-term study habits',
        'Building projects that test and apply what I learn',
      ],
    },
    {
      headingId: 'hobby-faith',
      sectionId: 'faith',
      sectionLabel: 'Faith',
      title: 'Faith and Values',
      description:
        'Islam and religious grounding are central in my life. They shape my priorities, discipline, and sense of purpose.',
    },
    {
      headingId: 'hobby-intentional',
      sectionId: 'intentional-living',
      sectionLabel: 'Intentional Living',
      title: 'Digital Minimalism and Intentional Living',
      description:
        'I am actively moving toward a more intentional digital life: less noise, fewer distractions, and more focused work and study.',
      points: [
        'Reducing low-value screen time',
        'Keeping simple workflows and fewer tools',
        'Prioritizing depth, consistency, and real-world impact',
      ],
    },
  ] as HobbyCard[],
};
