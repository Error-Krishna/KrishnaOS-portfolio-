import { useCallback, useMemo, useState } from 'react';

export type JobStatus =
  | 'Pending'
  | 'Applied'
  | 'Shortlisted'
  | 'OA Received'
  | 'Interview Scheduled'
  | 'Offer Received'
  | 'Rejected'
  | 'Not Applied';

export interface JobRecord {
  id: string;
  title: string;
  company: string;
  platform: string;
  location: string;
  salary: string;
  link: string;
  status: JobStatus;
  notes: string;
}

const PLATFORMS = [
  'Indeed',
  'LinkedIn',
  'Internshala',
  'Naukri',
  'Unstop',
  'Wellfound',
  'Glassdoor',
] as const;

const SAMPLE_JOBS: Omit<JobRecord, 'status' | 'notes'>[] = [
  {
    id: 'job-1',
    title: 'Full Stack Engineer',
    company: 'Digital Alpha Technologies',
    platform: 'LinkedIn',
    location: 'Remote · India',
    salary: '₹8–14 LPA',
    link: 'https://example.com/jobs/full-stack-engineer',
  },
  {
    id: 'job-2',
    title: 'Software Engineer',
    company: 'CloudScale',
    platform: 'Indeed',
    location: 'Bengaluru',
    salary: '₹7–12 LPA',
    link: 'https://example.com/jobs/software-engineer',
  },
  {
    id: 'job-3',
    title: 'Backend Developer',
    company: 'FinStack',
    platform: 'Naukri',
    location: 'Pune',
    salary: '₹6–11 LPA',
    link: 'https://example.com/jobs/backend-developer',
  },
  {
    id: 'job-4',
    title: 'Frontend Engineer',
    company: 'BuildLabs',
    platform: 'Wellfound',
    location: 'Remote',
    salary: '₹8–15 LPA',
    link: 'https://example.com/jobs/frontend-engineer',
  },
  {
    id: 'job-5',
    title: 'Graduate Software Engineer',
    company: 'TechWorks',
    platform: 'Unstop',
    location: 'Chennai',
    salary: '₹5–8 LPA',
    link: 'https://example.com/jobs/graduate-engineer',
  },
  {
    id: 'job-6',
    title: 'Python Developer',
    company: 'DataForge',
    platform: 'Internshala',
    location: 'Remote',
    salary: '₹5–9 LPA',
    link: 'https://example.com/jobs/python-developer',
  },
];

export function useJobAutomationRuntime() {
  const [keywords, setKeywords] = useState('software engineer, full stack');
  const [location, setLocation] = useState('India');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    ...PLATFORMS,
  ]);
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [searching, setSearching] = useState(false);

  const runSearch = useCallback(() => {
    setSearching(true);

    window.setTimeout(() => {
      const platformJobs = SAMPLE_JOBS.filter((job) =>
        selectedPlatforms.includes(job.platform),
      );

      setJobs(
        platformJobs.map((job, index) => ({
          ...job,
          id: `${job.id}-${Date.now()}-${index}`,
          location: location || job.location,
          status: 'Pending',
          notes: '',
        })),
      );

      setSearching(false);
    }, 900);
  }, [location, selectedPlatforms]);

  const togglePlatform = useCallback((platform: string) => {
    setSelectedPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform],
    );
  }, []);

  const updateJob = useCallback(
    (id: string, patch: Partial<JobRecord>) => {
      setJobs((current) =>
        current.map((job) =>
          job.id === id ? { ...job, ...patch } : job,
        ),
      );
    },
    [],
  );

  const reset = useCallback(() => {
    setJobs([]);
    setSearching(false);
  }, []);

  const stats = useMemo(() => {
    const counts = jobs.reduce<Record<string, number>>((acc, job) => {
      acc[job.status] = (acc[job.status] ?? 0) + 1;
      return acc;
    }, {});

    return {
      total: jobs.length,
      pending: counts.Pending ?? 0,
      applied: counts.Applied ?? 0,
      shortlisted: counts.Shortlisted ?? 0,
      interviews: counts['Interview Scheduled'] ?? 0,
      offers: counts['Offer Received'] ?? 0,
    };
  }, [jobs]);

  return {
    keywords,
    setKeywords,
    location,
    setLocation,
    selectedPlatforms,
    togglePlatform,
    jobs,
    searching,
    runSearch,
    updateJob,
    reset,
    stats,
    platforms: PLATFORMS,
  };
}
