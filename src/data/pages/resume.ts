import { heroImages } from '../image-assets';

export const resumePageContent = {
  seoDescription: 'Latest resume for Nour Gaser Algendi.',
  hero: {
    kicker: 'Professional document',
    title: 'Resume',
    description: 'Download or preview the latest resume.',
    image: heroImages.galaxy,
    sectionId: 'resume-hero',
    sectionLabel: 'Resume Hero',
  },
  resumeFile: '/resume.pdf',
  previewTitle: 'Resume PDF preview',
  actions: [
    { href: '/resume.pdf', label: 'Download PDF', download: true },
    { href: '/business', label: 'Go to business profile' },
  ],
};
