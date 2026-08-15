import type {
  Achievement,
  EducationEntry,
  Experience,
  Project,
} from '@krishnaos/shared-types';

/**
 * Public portfolio content for Krishna Goyal.
 *
 * IMPORTANT:
 * This file is intentionally limited to public/professional information.
 * Private/admin information from krish_private.md must never be exposed
 * through this client-side content.
 *
 * Source of truth:
 * - krish_public.md → public-facing profile
 * - krish_private.md → private/admin context only
 */

/* -------------------------------------------------------------------------- */
/* ABOUT                                                                       */
/* -------------------------------------------------------------------------- */

export const ABOUT_CONTENT = {
  name: 'Krishna Goyal',

  headline: 'Product-Minded Frontend & Full-Stack Engineer',

  bio: [
    'I’m Krishna Goyal, a Computer Science student and product-minded developer who enjoys turning real-world problems into practical software.',

    'I work across frontend engineering, full-stack development, SaaS products, developer tools, automation, data-driven applications, and product architecture. I particularly enjoy building polished interfaces with React, designing systems end-to-end, and understanding how software works beneath the surface.',

    'I like building things from scratch — from business software for manufacturers to developer tooling and automation systems. My goal is to combine strong engineering fundamentals with product thinking and create software that is genuinely useful.',
  ],
};

/* -------------------------------------------------------------------------- */
/* PROFILE LINKS                                                               */
/* -------------------------------------------------------------------------- */

export const PROFILE_LINKS = {
  resume: '',
  github: 'https://github.com/Error-Krishna',
  linkedin: 'https://linkedin.com/in/krishna2611',
  email: 'mailto:iamkrishnagoyal@gmail.com',
  portfolio: 'https://personal-portfolio-whoami-1.onrender.com',
} as const;

/* -------------------------------------------------------------------------- */
/* PROJECTS                                                                    */
/* -------------------------------------------------------------------------- */

export const PROJECTS_CONTENT: Project[] = [
  {
    id: 'project-udhyog-saathi',

    title: 'Udhyog Saathi',

    summary:
      'A Business Operating System designed to digitize and simplify workflows for small and mid-sized manufacturers.',

    description:
      'Udhyog Saathi is a SaaS product focused on bringing essential manufacturing operations into one system. It combines business dashboards, invoicing, inventory, raw-material tracking, worker management, warehouse operations, production monitoring, billing analytics, payment tracking, and automation workflows. The product is designed around the practical realities of manufacturing businesses and aims to reduce repetitive manual work while improving operational visibility.',

    role: 'Co-founder & Frontend/Product Developer',

    stack: [
      'React',
      'JavaScript',
      'Node.js',
      'Express.js',
      'MongoDB',
      'REST APIs',
      'WebSockets',
    ],

    links: {
      live: 'https://udhyogsaathi.in/',
      github: 'https://github.com/Manish-bhargava/udhyog-saathi-frontend',
    },

    featured: true,
  },

  {
    id: 'project-hotreload',

    title: 'HotReload',

    summary:
      'A Go-based developer CLI that automatically watches files and manages server rebuilds and restarts.',

    description:
      'HotReload is a developer productivity tool built in Go. It watches project files recursively, detects changes, debounces rapid filesystem events, and gracefully restarts the running process. It also includes project auto-detection and process lifecycle management to create a faster development feedback loop.',

    role: 'Developer & Maintainer',

    stack: [
      'Go',
      'fsnotify',
      'CLI',
      'File Watching',
      'Process Management',
    ],

    links: {
      github: 'https://github.com/Error-Krishna/hotreload',
      // demo: 'https://www.loom.com/share/773d4d8fdd1840128b92929643a08965',
    },

    featured: true,
  },

  {
    id: 'project-insightloop',

    title: 'InsightLoop',

    summary:
      'A full-stack business management and analytics platform focused on operational visibility.',

    description:
      'InsightLoop is a business management application designed to provide visibility into sales, payments, workers, profitability, and operational activity. The platform includes a real-time dashboard, WebSocket-based synchronization, and an AI assistant for operational support.',

    role: 'Full-Stack Developer',

    stack: [
      'React.js',
      'Node.js',
      'Express.js',
      'MongoDB',
      'WebSockets',
    ],

    links: {
      live: 'https://insightloop.onrender.com/',
      github: 'https://github.com/Error-Krishna/InsightLoop',
    },

    featured: true,
  },

  {
    id: 'project-personal-finance-tracker',

    title: 'Personal Finance Tracker',

    summary:
      'A personal finance application for tracking and visualizing financial activity.',

    description:
      'A finance tracking application built to manage personal financial data and visualize spending information. The project used Flask and MongoDB for the application backend and Chart.js for data visualization. Related backend work was later explored with Django.',

    role: 'Full-Stack Developer',

    stack: [
      'Python',
      'Flask',
      'MongoDB',
      'Chart.js',
    ],

    links: {},

    featured: false,
  },

  {
    id: 'project-job-automation',

    title: 'Job Automation System',

    summary:
      'A Python-based system for discovering, tracking, and automating parts of the job application workflow.',

    description:
      'A personal automation project designed to reduce repetitive job-search work. It searches job opportunities across multiple platforms, uses configurable keywords and location preferences, tracks discovered and processed jobs, and provides CLI workflows for managing the system. The project uses Selenium/browser automation together with local CSV-based tracking.',

    role: 'Automation Developer',

    stack: [
      'Python',
      'Selenium',
      'Browser Automation',
      'CSV',
      'CLI',
    ],

    links: {},

    featured: false,
  },
];

/* -------------------------------------------------------------------------- */
/* EXPERIENCE                                                                  */
/* -------------------------------------------------------------------------- */

export const EXPERIENCE_CONTENT: Experience[] = [
  {
    id: 'exp-udhyog-saathi',

    company: 'Udhyog Saathi',

    title: 'Co-founder & Frontend/Product Developer',

    startDate: '2024',

    endDate: 'present',

    highlights: [
      'Building a SaaS Business Operating System for small and mid-sized manufacturers.',

      'Working across frontend development, product design, business workflows, and system architecture.',

      'Developing workflows for dashboards, invoicing, inventory, raw materials, workers, warehouse operations, production, billing, and payments.',

      'Focusing on reducing manual operational work and improving visibility across manufacturing workflows.',
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* EDUCATION                                                                   */
/* -------------------------------------------------------------------------- */

export const EDUCATION_CONTENT: EducationEntry[] = [
  {
    id: 'edu-vit-ap',

    institution: 'Vellore Institute of Technology (VIT-AP)',

    degree: 'B.Tech in Computer Science',

    startDate: '2023',

    endDate: '2027',
  },

  {
    id: 'edu-school',

    institution: 'Satynarayan Academy',

    degree: 'PCM with Computer Science',

    startDate: '2021',

    endDate: '2023',
  },
];

/* -------------------------------------------------------------------------- */
/* ACHIEVEMENTS                                                                */
/* -------------------------------------------------------------------------- */

export const ACHIEVEMENTS_CONTENT: Achievement[] = [
  {
    id: 'achievement-ey-techathon',

    title: 'EY Techathon 5.0',

    description:
      'Successfully cleared Round 1 of EY Techathon 5.0, a national-level technology competition.',

    date: '2023',
  },

  {
    id: 'achievement-smart-india-hackathon',

    title: 'Smart India Hackathon 2023',

    description:
      'Participated in Smart India Hackathon 2023, a national-level innovation and problem-solving competition.',

    date: '2023',
  },

  {
    id: 'achievement-mern-certification',

    title: 'Full Stack Development (MERN)',

    description:
      'Completed a Full Stack Development certification covering the MERN technology stack through BlackBucks.',

    date: '2024',
  },

  {
    id: 'achievement-aws-certification',

    title: 'Cloud Computing (AWS)',

    description:
      'Completed a Cloud Computing certification focused on AWS through Corizo.',

    date: '2024',
  },
];

/* -------------------------------------------------------------------------- */
/* CERTIFICATIONS                                                              */
/* -------------------------------------------------------------------------- */

export const CERTIFICATIONS_CONTENT = [
  {
    id: 'cert-mern',

    title: 'Full Stack Development (MERN)',

    issuer: 'BlackBucks',

    link:
      'https://drive.google.com/file/d/1XicthKv4BbeKMkCCEPDSseEfGlylK0Ce/view?usp=sharing',
  },

  {
    id: 'cert-aws',

    title: 'Cloud Computing (AWS)',

    issuer: 'Corizo',

    link:
      'https://drive.google.com/file/d/1Vpar3ulUsRu0NGGT59QtBD-WaD4u_RAQ/view?usp=drive_link',
  },
] as const;

/* -------------------------------------------------------------------------- */
/* SKILLS                                                                      */
/* -------------------------------------------------------------------------- */

export interface SkillGroup {
  id: string;
  label: string;
  skills: string[];
}

export const SKILLS_CONTENT: SkillGroup[] = [
  {
    id: 'languages',

    label: 'Languages',

    skills: [
      'Java',
      'Python',
      'JavaScript',
      'HTML',
      'CSS',
      'SQL',
      'Go',
    ],
  },

  {
    id: 'frontend',

    label: 'Frontend',

    skills: [
      'React.js',
      'JavaScript',
      'HTML/CSS',
      'Chart.js',
      'Responsive Web Development',
      'UI/UX',
      'React Hooks',
      'Component Architecture',
    ],
  },

  {
    id: 'backend',

    label: 'Backend',

    skills: [
      'Node.js',
      'Express.js',
      'Django',
      'Flask',
      'REST APIs',
      'WebSockets',
      'ASGI',
      'Daphne',
      'Uvicorn',
    ],
  },

  {
    id: 'databases',

    label: 'Databases & Data',

    skills: [
      'MongoDB',
      'MongoDB Atlas',
      'MongoDB Compass',
      'MySQL',
      'Firebase',
      'Redis',
      'SQL',
      'Data Visualization',
      'EDA',
    ],
  },

  {
    id: 'tools',

    label: 'Tools & Platforms',

    skills: [
      'Git',
      'GitHub',
      'AWS',
      'Render',
      'Docker',
      'Notion',
      'Trello',
      'Postman',
      'Homebrew',
      'Figma',
      'Android Studio',
      'Flutter',
    ],
  },

  {
    id: 'engineering',

    label: 'Engineering',

    skills: [
      'CLI Development',
      'Automation',
      'File Watching',
      'Process Management',
      'WebSockets',
      'Deployment',
      'Debugging',
      'API Integration',
      'SaaS Architecture',
      'Product Architecture',
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* LEADERSHIP                                                                  */
/* -------------------------------------------------------------------------- */

export const LEADERSHIP_CONTENT = [
  {
    id: 'leadership-hindi-association',

    title: 'President — Hindi Association',

    organization: 'VIT-AP',

    description:
      'Led the university Hindi association and organized cultural activities for the student community.',
  },

  {
    id: 'leadership-up-rally',

    title: 'State-Coordinator — UP State Rally',

    organization: 'University Fest',

    description:
      'Coordinated logistics and participation support for a state-level rally.',
  },
] as const;

/* -------------------------------------------------------------------------- */
/* INTERESTS                                                                   */
/* -------------------------------------------------------------------------- */

export const INTERESTS_CONTENT = [
  'Frontend Engineering',
  'React',
  'Full-Stack Development',
  'SaaS',
  'Developer Tools',
  'Automation',
  'AI-Assisted Software',
  'Data Analytics',
  'Data Visualization',
  'Product Design',
  'Systems Thinking',
  'Business Software',
  'Manufacturing Technology',
  'Developer Productivity',
  'Building Products from Scratch',
] as const;

/* -------------------------------------------------------------------------- */
/* FEATURED PROJECTS                                                           */
/* -------------------------------------------------------------------------- */

/**
 * The subset of PROJECTS_CONTENT that should appear in Recruiter Mode
 * and other featured-project sections.
 *
 * Keeping this as a single derived source prevents different parts of the
 * application from maintaining their own featured-project lists.
 */
export const FEATURED_PROJECTS: Project[] =
  PROJECTS_CONTENT.filter((project) => project.featured);