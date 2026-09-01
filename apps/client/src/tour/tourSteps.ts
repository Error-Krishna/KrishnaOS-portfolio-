import type { TourStepId } from "@/store/useTourStore";
import type { AppId } from "@/os/appRegistry";

export interface TourStepDetails {
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  hint: string;
}

export const TOUR_STEP_TO_APP: Record<TourStepId, AppId | null> = {
  about: "about",
  work: null,
  projects: "projects",
  skills: "skills",
  experience: "experience",
  education: "education",
  achievements: "achievements",
  contact: "contact",
};

export const TOUR_STEP_LABELS: Record<TourStepId, string> = {
  about: "About",
  work: "Work",
  projects: "Projects",
  skills: "Skills",
  experience: "Experience",
  education: "Education",
  achievements: "Achievements",
  contact: "Contact",
};

export const TOUR_STEP_DETAILS: Record<TourStepId, TourStepDetails> = {
  about: {
    label: "About",
    eyebrow: "01 / 08",
    title: "Meet the developer behind KrishnaOS.",
    description:
      "Start with the person, the engineering mindset, and the story behind the work.",
    hint: "Explore the profile and get the context before diving into the projects.",
  },

  work: {
    label: "Work",
    eyebrow: "02 / 08",
    title: "What I build and how I think.",
    description:
      "This step frames the kind of problems I enjoy solving and the role technology plays in my work.",
    hint: "Take a moment to understand the bigger picture.",
  },

  projects: {
    label: "Projects",
    eyebrow: "03 / 08",
    title: "Now, let the work speak.",
    description:
      "Explore the products, experiments, and systems I have built across the stack.",
    hint: "Open a project and explore it like you would on the real desktop.",
  },

  skills: {
    label: "Skills",
    eyebrow: "04 / 08",
    title: "The tools behind the work.",
    description:
      "From frontend interfaces to backend systems, these are the technologies I use to turn ideas into working software.",
    hint: "Look through the stack and connect the tools to the projects.",
  },

  experience: {
    label: "Experience",
    eyebrow: "05 / 08",
    title: "Experience that shaped the builder.",
    description:
      "A quick look at the environments, responsibilities, and experiences that have influenced my engineering journey.",
    hint: "Follow the progression rather than just the titles.",
  },

  education: {
    label: "Education",
    eyebrow: "06 / 08",
    title: "The foundation underneath it all.",
    description:
      "See the academic path and the foundation supporting the practical engineering work.",
    hint: "The journey continues beyond individual projects.",
  },

  achievements: {
    label: "Achievements",
    eyebrow: "07 / 08",
    title: "Signals of progress.",
    description:
      "A collection of milestones and achievements that show consistency, curiosity, and growth.",
    hint: "Look for the moments that stand out.",
  },

  contact: {
    label: "Contact",
    eyebrow: "08 / 08",
    title: "Like what you see?",
    description:
      "If the work looks interesting, this is where the next conversation starts.",
    hint: "Reach out, explore freely, or restart the tour.",
  },
};
