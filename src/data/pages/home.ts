import type { ImageMetadata } from 'astro';

import { aboutImages } from '../image-assets';

export type HomeSectionLink = {
  href: string;
  label: string;
};

export type HomeSection = {
  id?: string;
  sectionId: string;
  sectionLabel: string;
  title: string;
  boxClassName: string;
  image: ImageMetadata;
  paragraphs: string[];
  links?: HomeSectionLink[];
};

export const homePageContent = {
  seoDescription: 'About Nour Gaser Algendi, projects, hobbies, and professional goals.',
  hero: {
    kicker: 'About me',
    introText:
      "Why anyone would be interested in reading about me is beyond me... Unless you're a potential business partner, in which case I implore you to continue.",
    image: aboutImages.manOnPlanet,
    ctaHref: '#business-and-profession',
    ctaLabel: 'Straight to business',
  },
  sections: [
    {
      sectionId: 'who-am-i',
      sectionLabel: 'Who Am I',
      title: 'Who am I?',
      boxClassName: 'about-box--who',
      image: aboutImages.cave,
      paragraphs: [
        "As much as I disagree with (and don't think it possible) defining anyone with only a few lines of text, I'll try my best. My name is Nour Gaser Algendi, I was born in 2001 in Egypt, and that's as much as I'm willing to leave online. I'm a nerdy (duh), science enthusiast that wears his love for science (all STEM fields) and science fiction in proudness. I'm overly critical of people's judgement and their acceptance of knowledge, I always require sources for information, and I'm opinionated and argumentative when it comes to certain topics (don't get me started on horoscopes and all of the bogus personality tests).",
        "It's worth mentioning that I am against the trendy opinion of the critisim of traditional education and academics, I believe in education (as a right and as a choice). Reading Google's top search results and 3 lines from a wikipedia page, or copying code from stackoverflow, is not knowledge or science; our world is barely stitched together by half-assed jobs done to their minimum quality by people who wanted to (and could only) just get the job done. Employees which have no education and have only one practical skill learned by doing are capitalists' dreams, not the world's or the advancement of science's.",
      ],
    },
    {
      sectionId: 'productivity-and-projects',
      sectionLabel: 'Productivity and Projects',
      title: 'Productivity and Projects',
      boxClassName: 'about-box--productivity',
      image: aboutImages.brain,
      paragraphs: [
        "Aside from professional projects, my personal projects (what I actually enjoy working on) are mostly all nerdy, useless (I'll argue against that till the morning, but there's a general consensus from my obviously wrong circle of friends/family) ideas which no one cares about aside from me. These range from weird electronics/digital logic/arduino project ideas which I fail to put together, to web-dev and CLI project ideas which are hard to explain, expensive to host, hard to implement, and no one would use but me, like this very website's own engine, ngxos.",
        "I also create random apps and websites here and there to learn new technologies; these range from react-native mobile apps, outdatted java jframes and c++ qt desktop apps, video games with unity, and various websites' frontends and backends using a wide range of technologies (but mostly MERN stack); I'll refer you to my skills and experiences page for more details about that. There's a few more small projects, but that's honestly all that comes to mind.",
        "For my current proejcts, there's a few but the most notable are a skill-list generator app (using ml and online vcs hosting websites' APIs), and a turn-based fighting game which combines elements from Xcoms's perfect RNG system (in my opinion), League of Legends' rich character abilities and lore and surprising keystone synnergies, and Hearthstone's card collection system.",
        "One more thing, don't get fooled by my personal website's nerdy design, this is my personal preference (I'd throw my mouse from the window and use only my keyboard if I could), and it's a change of scenery from all of the material design that I do to follow the current web-dev market standards (again, I refer you to the link above).",
      ],
    },
    {
      sectionId: 'hobbies',
      sectionLabel: 'Hobbies',
      title: 'Hobbies',
      boxClassName: 'about-box--hobbies',
      image: aboutImages.spaceSpaceship,
      paragraphs: [
        'This website should give you a sense of what I enjoy in life, but if I had to list it roughly in order of appreciation: music (aside from a few genres that appall me), programming, anything related to Linux and open-source software (GNU people are welcome), STEM-related news, technical articles, video content, science fiction novels, TV shows, movies, and writing (as these walls of text indicate).',
        'A lot of that naturally overlaps with what I care about most: disciplined learning, meaningful creative work, and building expressive systems that are actually useful. And yes, surprisingly near the bottom of my interests are video games; I enjoy developing them, theory-crafting ideas and wacky synergies, and writing game content more than actually playing them. I am also moving toward digital minimalism and more intentional living, guided by faith and values. And lastly, I use vim by the way.',
      ],
      links: [{ href: '/hobbies', label: 'Open the full hobbies page' }],
    },
    {
      id: 'business-and-profession',
      sectionId: 'business-and-profession',
      sectionLabel: 'Business and Profession',
      title: 'Business and Profession',
      boxClassName: 'about-box--business',
      image: aboutImages.space,
      paragraphs: [
        "If you're here for professional work, consultancy, or collaboration, head to the dedicated business page for current experience, expertise, and contact points.",
      ],
      links: [
        { href: '/business', label: 'Open business profile' },
        { href: '/skills', label: 'View skills' },
        { href: '/resume', label: 'Resume' },
        { href: '/portfolio', label: 'Portfolio' },
      ],
    },
  ] as HomeSection[],
};
