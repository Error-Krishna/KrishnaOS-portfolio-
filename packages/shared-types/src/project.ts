export interface ProjectMedia {
  type: 'image' | 'video';
  url: string;
  alt?: string;
}

export interface ProjectLinks {
  live?: string;
  github?: string;
  caseStudy?: string;
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  description: string;
  role: string;
  stack: string[];
  links: ProjectLinks;
  /** true = surfaced in Recruiter Mode's condensed "featured" list */
  featured: boolean;
  media?: ProjectMedia[];
}
