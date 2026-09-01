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
export interface AboutSection {
  id: string;
  kind: 'story' | 'quote' | 'traits';
  heading?: string;
  body?: string[];
  quote?: string;
  items?: string[];
}
export interface AboutBadge {
  label: string;
}

export interface AboutStatus {
  label: string;   
  lines: string[]; 
}

export interface AboutContent {
  name: string;
  headline: string;
  bio: string[];
  tagline: string;
  sections: AboutSection[];
  badges: AboutBadge[];
  welcomeBadge: string;
  status: AboutStatus;
  photoUrl: string;          
}

export const ABOUT_CONTENT: AboutContent = {

  name: 'Krishna Goyal',

  headline: 'Product-Minded Frontend & Full-Stack Engineer',

  bio: [

    'I am a Computer Science student and builder who enjoys understanding how things work and then turning that understanding into something people can actually use.',

    'My journey has moved from learning the fundamentals of programming to building full-stack applications, developer tools, automation systems, and products around real business problems. I learn best by building, breaking things, debugging them, and trying again.',

    'I am especially drawn to frontend engineering because I like the intersection of engineering and product thinking: how a system works underneath, but also how it feels when someone uses it. At the same time, I enjoy going deeper into backend systems, APIs, databases, WebSockets, deployment, and the problems that appear when software becomes real.',

  ],

  tagline: "I don't just want to build things. I want to build myself.",

  sections: [

    {

      id: 'identity',

      kind: 'quote',

      quote:

        "I don't see myself as just an engineering student who codes. I see myself as a builder.",

    },

    {

      id: 'curiosity',

      kind: 'traits',

      heading: 'Questions I keep asking myself',

      items: [

        'What actually happens when I enter a URL?',

        'How does fullscreen logic work?',

        "What happens when there's no internet?",

        'Why is this server failing?',

        'How can I turn a technical idea into something people actually want to use?',

        'What is the simplest way to build this properly?',

      ],

    },

    {

      id: 'journey',

      kind: 'story',

      heading: 'The journey so far',

      body: [

        'I started with the usual curiosity of wanting to understand code, but over time I became more interested in building complete things rather than only solving isolated problems. That led me into frontend development, backend systems, databases, APIs, deployment, automation, and eventually product development.',

        'Along the way, I have built projects such as InsightLoop, a personal finance tracker, a job automation system, and HotReload, a developer CLI. I am also building Udhyog Saathi, a SaaS product aimed at helping small and mid-sized manufacturers manage their day-to-day operations digitally.',

        'A lot of my learning has come from things going wrong: broken deployments, database connections, WebSockets, dependency conflicts, server errors, and features that looked simple until I actually had to build them. Those problems have taught me more than simply following tutorials ever could.',

      ],

    },

    {

      id: 'self-awareness',

      kind: 'story',

      heading: "What I'm still working on",

      body: [

        'I am still learning how to distinguish movement from real progress. There is always another technology to learn, another project to start, or another idea to explore, but I am learning that building better requires focus, patience, and finishing what I start.',

        'I am also working on becoming stronger in the fundamentals behind the interfaces and products I build: computer science concepts, system design, backend architecture, data, and the reasoning that makes software reliable rather than merely functional.',

        'More than anything, I am learning to slow down enough to understand problems deeply instead of always rushing toward the next thing.',

      ],

    },

    {

      id: 'ambition',

      kind: 'story',

      heading: "What I'm building toward",

      body: [

        'I want to become an engineer who can take an idea from a rough problem statement to a working product. That means being comfortable with the interface users see, the systems underneath it, and the product decisions that connect the two.',

        'I want to keep building products from scratch, work on problems that have real users and real constraints, and eventually build technology that is useful beyond a portfolio or a college project.',

        'For me, the goal is not simply to collect technologies or titles. It is to become someone who can look at a problem, understand it deeply, build a thoughtful solution, and keep improving it.',

      ],

    },

    {

      id: 'krishnaos-meaning',

      kind: 'quote',

      quote:

        "I'm not simply trying to make a portfolio. I want them to experience: this is Krishna.",

    },

  ],
  badges: [
    {label: '📍 India'},
    {label: '🎓 CS Student'},
    {label: '💡 Builder'},
    {label: '🚀 Life-long Learner'},
    
  ],
  welcomeBadge: '👋 Welcome to my portfolio!',
  status: {
    label: 'Currently:',
    lines: [
      'Building Cool things',
      'Solving real problems'
    ]
  },
  photoUrl: 'https://res.cloudinary.com/dt131godr/image/upload/v1787050172/motion_photo_2308644998421275287_kppqhx.jpg',

};

/* -------------------------------------------------------------------------- */
/* ABOUT: JOURNEY PIPELINE                                                    */
/* -------------------------------------------------------------------------- */

/**
 * A compact, scannable restatement of ABOUT_CONTENT.sections['journey'].body
 * for the visual pipeline (icon nodes + connecting line). Every blurb below
 * paraphrases a sentence Krishna already wrote in that section — nothing
 * here introduces a new personal claim, it just reformats existing prose
 * into a four-stage visual instead of three paragraphs of running text.
 */
export interface JourneyStage {
  id: string;
  title: string;
  blurb: string;
  detail: string;
}

export const ABOUT_JOURNEY_STAGES: JourneyStage[] = [
  {
    id: 'curiosity',
    title: 'Curiosity',
    blurb: 'Starting with "how do things work?"',
    detail: 'Explored code, logic, and the basics.',
  },
  {
    id: 'learning',
    title: 'Learning',
    blurb: 'From tutorials to real projects.',
    detail: 'Built, broke, debugged, and learned deeply.',
  },
  {
    id: 'building',
    title: 'Building',
    blurb: 'Turning ideas into working products.',
    detail: 'Projects and systems that solve real problems.',
  },
  {
    id: 'purpose',
    title: 'Purpose',
    blurb: 'Building technology that creates impact.',
    detail: 'Helping businesses solve real-world problems.',
  },
];

/**
 * Lifted from ABOUT_CONTENT.sections['journey'].body[2] — the list of
 * things Krishna named as his real teachers — split for the compact
 * "Key Learnings" strip rather than re-parsing the paragraph at render
 * time.
 */
export const ABOUT_KEY_LEARNINGS: string[] = [
  'Broken deployments',
  'Database connections',
  'WebSockets',
  'Dependency conflicts',
  'Server errors',
  'And what looked simple until I built it',
];

/* -------------------------------------------------------------------------- */
/* ABOUT: AMBITION PILLARS                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Same principle as ABOUT_JOURNEY_STAGES — a scannable restatement of
 * ABOUT_CONTENT.sections['ambition'].body, not new content.
 */
export interface AmbitionFocusItem {
  id: string;
  title: string;
  description: string;
}

export const ABOUT_AMBITION_FOCUS: AmbitionFocusItem[] = [
  {
    id: 'solve-real-problems',
    title: 'Solve real problems',
    description: 'Build products that users love and rely on.',
  },
  {
    id: 'create-impact',
    title: 'Create impact',
    description: 'Technology that makes a difference.',
  },
  {
    id: 'keep-improving',
    title: 'Keep improving',
    description: 'Always learning, always building better.',
  },
];

export interface AmbitionPillar {
  id: string;
  title: string;
  description: string;
}

export const ABOUT_AMBITION_PILLARS: AmbitionPillar[] = [
  {
    id: 'engineer',
    title: 'Engineer',
    description: 'Take ideas from rough problem statements to real products.',
  },
  {
    id: 'builder',
    title: 'Builder',
    description: 'Build from scratch, deal with real constraints, ship and iterate.',
  },
  {
    id: 'problem-solver',
    title: 'Problem Solver',
    description: 'Understand deeply, solve thoughtfully, improve continuously.',
  },
  {
    id: 'impact-maker',
    title: 'Impact Maker',
    description: 'Build technology that creates value and simplifies lives.',
  },
];

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

/**
 * Contact window's info-card copy (phone/location) and the "open to
 * opportunities" tag row. Kept separate from PROFILE_LINKS since these
 * aren't links to follow, just display facts. The phone number is real
 * (from krish_private.md) but was private-only until Krishna explicitly
 * confirmed showing it publicly here; location is deliberately
 * country-level only ("India"), not the more specific
 * state/institution-level detail also in the private notes, per Krishna's
 * own choice on how specific to be.
 */
export interface ContactPageContent {
  tagline: string;
  phone: string;
  location: string;
  opportunityLabel: string;
  opportunityTags: string[];
}

export const CONTACT_PAGE_CONTENT: ContactPageContent = {
  tagline: "Have a project in mind, want to collaborate, or just say hi? I'd love to hear from you!",
  phone: '+91 9064700906',
  location: 'India',
  opportunityLabel: 'Open to exciting opportunities and meaningful collaborations.',
  opportunityTags: ['Open Source', 'Freelance', 'Full-time', 'Internships'],
};

/* -------------------------------------------------------------------------- */
/* PROJECTS                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Header/eyebrow copy, the "Explore. Interact. Experience." callout, and
 * the closing CTA card for the Projects window — same content.ts-first
 * rule as every other redesigned page (see SkillsPageContent /
 * ExperiencePageContent). Per-project category and interactive-demo
 * wiring live in `apps/projects/runnerRegistry.ts`, not here, since that
 * mapping is about *how the window renders things* rather than public
 * profile content.
 */
export interface ProjectsPageContent {
  eyebrow: string;
  title: string;
  titleAccent: string;
  tagline: string;
  calloutHeading: string;
  calloutBody: string;
  closing: {
    heading: string;
    body: string;
    ctaLabel: string;
  };
}

export const PROJECTS_PAGE_CONTENT: ProjectsPageContent = {
  eyebrow: 'Explore. Interact. Experience.',
  title: 'My',
  titleAccent: 'Projects',
  tagline: "A collection of things I've built, experiments I've shipped, and problems I've solved.",
  calloutHeading: 'Explore. Interact. Experience.',
  calloutBody: "Every project below runs a real, interactive demo right inside KrishnaOS — try it before you take my word for it.",
  closing: {
    heading: 'Every project is a story of curiosity, learning, and building.',
    body: "Click around, try features, break things — that's how we grow.",
    ctaLabel: "Let's Connect →",
  },
};

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
    id: 'project-alpha-vault',

    title: 'Alpha Vault',

    summary:
      'A modern full-stack application focused on secure financial and portfolio management workflows.',

    description:
      'Alpha Vault is a full-stack application built to explore financial workflows, portfolio visibility, and modern application architecture.',

    role: 'Full-Stack Developer',

    stack: [
      'React',
      'TypeScript',
      'Node.js',
      'REST APIs',
    ],

    links: {
      github: 'https://github.com/Error-Krishna/Alpha-vault-frontend',
    },

    featured: false,
  },

  {
    id: 'project-epet',

    title: 'EPet',

    summary:
      'A digital platform project focused on building a modern pet-care experience.',

    description:
      'EPet is a project exploring digital workflows and user experiences for pet-related services and interactions.',

    role: 'Developer',

    stack: [
      'Web',
      'Frontend',
    ],

    links: {},

    featured: false,
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

/**
 * Header/eyebrow copy, badge pills, and the closing quote+traits for the
 * Experience window — same rationale as SkillsPageContent above: content
 * lives here, not as inline JSX strings, and nothing here is invented.
 * `badges` reuse Udhyog Saathi's real role/stack framing (SaaS, Full-Stack,
 * Product) rather than a separate skills-rating claim, per Krishna's
 * explicit choice over the reference's literal skill-percentage bars
 * (see docs/08-content-apps.md's Experience section for why those were
 * dropped entirely).
 */
export interface ExperiencePageContent {
  eyebrow: string;
  badges: string[];
  quote: {
    heading: string;
    lines: string[];
  };
  traits: { title: string; description: string }[];
}

export const EXPERIENCE_PAGE_CONTENT: ExperiencePageContent = {
  eyebrow: 'Current Role',
  badges: ['SaaS', 'Full-Stack', 'Product', 'Problem Solver', 'Builder'],
  quote: {
    heading: 'I believe in building things that make a difference.',
    lines: [
      'From ideation to implementation, I enjoy turning complex problems',
      'into simple, beautiful, and impactful products.',
    ],
  },
  traits: [
    { title: 'Curious Mind', description: 'Always exploring new technologies' },
    { title: 'Builder at Heart', description: 'Love turning ideas into real products' },
    { title: 'User Focused', description: 'Designing for real people & problems' },
  ],
};

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

/**
 * Header copy only — no stat footer, no subject tags, no decorative hero
 * illustration. KRISHNAOS_HANDS_ON_CONTEXT.md's Phase G is explicit that
 * Education should stay simple rather than become another dashboard
 * ("KrishnaOS demonstrates engineering through interaction where
 * interaction adds value, while simple information stays simple"), and
 * Krishna confirmed keeping it minimal over matching a decorated reference
 * design. This type exists only so the small header follows the same
 * "content lives in content.ts" rule as every other app, not to set up a
 * bigger page than what's actually being built.
 */
export interface EducationPageContent {
  eyebrow: string;
  tagline: string;
  closingNote: string;
}

export const EDUCATION_PAGE_CONTENT: EducationPageContent = {
  eyebrow: 'Always Learning',
  tagline: 'The foundation that shaped my thinking, problem-solving approach, and passion for building impactful products.',
  closingNote: "Education is not just about degrees, it's about understanding how things work and why.",
};

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

  {
    id: 'achievement-open-source-contributor',

    title: 'Open Source Contributor',

    description: 'Contributed to open source projects and collaborated with amazing developers.',

    date: '2024',
  },

  {
    id: 'achievement-continuous-learner',

    title: 'Continuous Learner',

    description: 'Consistently learning new technologies, tools, and best practices.',

    date: 'Always',
  },
];

/**
 * Header/eyebrow copy, stat labels, and the closing quote for the
 * Achievements window — same content.ts-first rule as every other page.
 * Stat numbers are NOT hardcoded here; AchievementsApp derives them live
 * from ACHIEVEMENTS_CONTENT so "10+ Achievements"-style counts can never
 * drift from the real array length.
 */
export interface AchievementsPageContent {
  eyebrow: string;
  tagline: string;
  quote: {
    heading: string;
    lines: string[];
  };
  ctaLabel: string;
}

export const ACHIEVEMENTS_PAGE_CONTENT: AchievementsPageContent = {
  eyebrow: 'Milestones & Beyond',
  tagline: 'Recognition of my efforts, consistency, and passion for building and solving.',
  quote: {
    heading: 'Achievements are temporary, but the learnings stay forever.',
    lines: ['I focus on growth, not just glory.'],
  },
  ctaLabel: "Let's build more →",
};

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

/**
 * Header/eyebrow copy and the closing quote card for the Skills window.
 * Kept as a small typed block (rather than inline JSX strings) so it
 * follows the same "content lives in content.ts" rule as everything else
 * on this page, per docs/08-content-apps.md. Stat-card numbers are NOT
 * hardcoded here — SkillsApp derives them live from SKILLS_CONTENT /
 * PROJECTS_CONTENT so they can never drift out of sync with the real data
 * (same reasoning TERMINAL_COMMANDS.run functions read live rather than
 * duplicating content).
 */
export interface SkillsPageContent {
  eyebrow: string;
  title: string;
  titleAccent: string;
  tagline: string;
  badges: string[];
  quote: {
    heading: string;
    lines: string[];
  };
}

export const SKILLS_PAGE_CONTENT: SkillsPageContent = {
  eyebrow: 'Always Learning',
  title: 'My',
  titleAccent: 'Skills',
  tagline:
    "A toolkit I've built through curiosity, consistency, and real-world projects. Always exploring. Always improving.",
  badges: ['Hands-on Experience', 'Problem Solver'],
  quote: {
    heading: 'I believe the best way to learn is by building.',
    lines: ['Every project, every bug, every fix —', 'adds a new skill to the toolkit.'],
  },
};

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

  {
    id: 'developer-tools',

    label: 'Developer Tools',

    skills: [
      'VS Code',
      'Terminal',
      'ESLint',
      'Prettier',
      'Jest',
      'Postman',
      'Thunder Client',
      'GitHub Actions',
      'NPM / Yarn',
    ],
  },

  {
    id: 'soft-skills',

    label: 'Soft Skills',

    skills: [
      'Problem Solving',
      'Critical Thinking',
      'System Design',
      'Adaptability',
      'Continuous Learning',
      'Team Collaboration',
      'Communication',
      'Ownership',
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

/* -------------------------------------------------------------------------- */
/* TERMINAL                                                                   */
/* -------------------------------------------------------------------------- */
export interface TerminalCommand {
  description: string;
  run: () => string[];
}

export const TERMINAL_COMMANDS: Record<string, TerminalCommand> = {
  whoami: {
    description: 'Display who I am',
    run: () => [`${ABOUT_CONTENT.name} — ${ABOUT_CONTENT.headline}`],
  },
  skills: {
    description: 'List my technical skills',
    run: () => SKILLS_CONTENT.map((group) => `${group.label}: ${group.skills.join(', ')}`),
  },
  projects: {
    description: 'List my featured projects',
    run: () => FEATURED_PROJECTS.map((p) => `${p.title} — ${p.summary}`),
  },
  help: {
    description: 'Show available commands',
    run: () => Object.entries(TERMINAL_COMMANDS).map(([name, cmd]) => `${name} — ${cmd.description}`),
  },
  clear: {
    description: 'Clear the terminal',
    run: () => [],
  },
};