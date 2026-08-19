import type { ReactElement } from 'react';
import type { AppId } from '@/os/appRegistry';

interface IconProps {
  className?: string;
}

function iconStrokeProps() {
  return {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

export function HomeGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...iconStrokeProps()} d="M4 11.5 12 5l8 6.5" />
      <path {...iconStrokeProps()} d="M6.5 10.5V19h11v-8.5" />
      <path {...iconStrokeProps()} d="M9.25 19v-5.25h5.5V19" />
    </svg>
  );
}


export function SearchGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle {...iconStrokeProps()} cx="11" cy="11" r="5.5" />
      <path {...iconStrokeProps()} d="m16 16 4 4" />
    </svg>
  );
}

export function ThemeGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...iconStrokeProps()} d="M12 4a8 8 0 1 0 0 16 8.5 8.5 0 0 1 0-16Z" />
      <path {...iconStrokeProps()} d="M12 4v16" />
    </svg>
  );
}

export function ClockGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle {...iconStrokeProps()} cx="12" cy="12" r="8" />
      <path {...iconStrokeProps()} d="M12 8.5V12l2.5 1.5" />
    </svg>
  );
}

export function WeatherGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...iconStrokeProps()} d="M8.5 15.5a4 4 0 1 1 1.2-7.8A5 5 0 1 1 19 12h-9" />
      <path {...iconStrokeProps()} d="M7.5 19.5h9" />
    </svg>
  );
}

export function GithubGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        {...iconStrokeProps()}
        d="M12 3.5a8.5 8.5 0 0 0-2.7 16.6c.4.1.5-.2.5-.4v-1.5c-2.1.5-2.6-1-2.6-1-.3-.8-.8-1-1.2-1.2-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.6 2.4 1.2 3 .9.1-.7.4-1.2.7-1.5-1.7-.2-3.5-.9-3.5-4a3.1 3.1 0 0 1 .8-2.2 2.8 2.8 0 0 1 .1-2.2s.7-.2 2.2.8a7.7 7.7 0 0 1 4 0c1.5-1 2.2-.8 2.2-.8.5.8.5 1.5.1 2.2.5.6.8 1.3.8 2.2 0 3.1-1.8 3.8-3.5 4 .3.3.6.9.6 1.8v2.6c0 .2.1.5.5.4A8.5 8.5 0 0 0 12 3.5Z"
      />
    </svg>
  );
}

export function TimelineGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...iconStrokeProps()} d="M7 9h10" />
      <path {...iconStrokeProps()} d="M8 12h6" />
      <path {...iconStrokeProps()} d="M8 15h9" />
      <circle {...iconStrokeProps()} cx="16" cy="9" r="0.8" />
      <circle {...iconStrokeProps()} cx="14" cy="12" r="0.8" />
      <circle {...iconStrokeProps()} cx="17" cy="15" r="0.8" />
      <circle {...iconStrokeProps()} cx="12" cy="12" r="11" />
    </svg>
  );
}

export function RocketGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        {...iconStrokeProps()}
        d="M12 3c2.5 1.5 4 4.3 4 7.8 0 2-1 4.2-2.5 5.7L12 18l-1.5-1.5C9 15 8 12.8 8 10.8 8 7.3 9.5 4.5 12 3Z"
      />
      <circle {...iconStrokeProps()} cx="12" cy="10" r="1.6" />
      <path {...iconStrokeProps()} d="M9.5 15.5 7 17.5l.6-3.2" />
      <path {...iconStrokeProps()} d="M14.5 15.5 17 17.5l-.6-3.2" />
      <path {...iconStrokeProps()} d="M10.5 18.5c.5 1 2.5 1 3 0" />
    </svg>
  );
}

export function NoteGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...iconStrokeProps()} d="M6 4.5h9L18.5 8v11.5H6z" />
      <path {...iconStrokeProps()} d="M15 4.5V8h3.5" />
      <path {...iconStrokeProps()} d="M8.5 12h7" />
      <path {...iconStrokeProps()} d="M8.5 15h5" />
    </svg>
  );
}
export function FullScreenGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        {...iconStrokeProps()}
        d="M9 5H5v4M15 5h4v4M9 19H5v-4M19 15v4h-4"
        stroke="#60a5fa"
      />
      <path
        {...iconStrokeProps()}
        d="M8 8 5 5M16 8l3-3M8 16l-3 3M16 16l3 3"
        stroke="#60a5fa"
      />
    </svg>
  );
}

export function LinkGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        {...iconStrokeProps()}
        d="M9.5 14.5 14.5 9.5"
        stroke="#60a5fa"
      />
      <path
        {...iconStrokeProps()}
        d="M8 17H6.5a4 4 0 0 1 0-8H10"
        stroke="#a78bfa"
      />
      <path
        {...iconStrokeProps()}
        d="M16 7h1.5a4 4 0 0 1 0 8H14"
        stroke="#a78bfa"
      />
    </svg>
  );
}

export function WifiOffGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        {...iconStrokeProps()}
        d="M4.5 9.5a11.5 11.5 0 0 1 15 0"
        stroke="#38bdf8"
      />
      <path
        {...iconStrokeProps()}
        d="M7.5 13a7 7 0 0 1 4.5-1.6 7 7 0 0 1 4.5 1.6"
        stroke="#38bdf8"
      />
      <path
        {...iconStrokeProps()}
        d="M10.5 16.5a3 3 0 0 1 3 0"
        stroke="#38bdf8"
      />
      <path
        {...iconStrokeProps()}
        d="M4 4l16 16"
        stroke="#f87171"
      />
    </svg>
  );
}

export function ServerGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect
        {...iconStrokeProps()}
        x="5"
        y="5"
        width="14"
        height="4"
        rx="1"
        stroke="#60a5fa"
      />
      <rect
        {...iconStrokeProps()}
        x="5"
        y="10"
        width="14"
        height="4"
        rx="1"
        stroke="#60a5fa"
      />
      <rect
        {...iconStrokeProps()}
        x="5"
        y="15"
        width="14"
        height="4"
        rx="1"
        stroke="#60a5fa"
      />
      <circle
        {...iconStrokeProps()}
        cx="8"
        cy="7"
        r="0.7"
        fill="#4ade80"
        stroke="#4ade80"
      />
    </svg>
  );
}

export function LightbulbGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        {...iconStrokeProps()}
        d="M8 14a6 6 0 1 1 8 0c-.9.8-1.5 1.7-1.5 3H9.5c0-1.3-.6-2.2-1.5-3Z"
        stroke="#facc15"
      />
      <path
        {...iconStrokeProps()}
        d="M9.5 19h5"
        stroke="#f59e0b"
      />
      <path
        {...iconStrokeProps()}
        d="M10 21h4"
        stroke="#f59e0b"
      />
    </svg>
  );
}

export function TargetGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle
        {...iconStrokeProps()}
        cx="12"
        cy="12"
        r="8"
        stroke="#fb7185"
      />
      <circle
        {...iconStrokeProps()}
        cx="12"
        cy="12"
        r="4"
        stroke="#f97316"
      />
      <circle
        {...iconStrokeProps()}
        cx="12"
        cy="12"
        r="1.2"
        fill="#ef4444"
        stroke="#ef4444"
      />
    </svg>
  );
}

export function QuestionGlyph({ className }: IconProps) {
  return (

    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle {...iconStrokeProps()} cx="12" cy="12" r="11" />
      <path {...iconStrokeProps()} d="M9.5 9a2.5 2.5 0 1 1 4.3 1.8c-.9.8-1.8 1.2-1.8 2.7" />
      <circle {...iconStrokeProps()} cx="12" cy="16.5" r="0.7" />
    </svg>
  );
}
function AboutGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle {...iconStrokeProps()} cx="12" cy="8" r="3" />
      <path {...iconStrokeProps()} d="M6.5 19a5.5 5.5 0 0 1 11 0" />
    </svg>
  );
}

function ProjectsGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...iconStrokeProps()} d="M5 7.5h14v9H5z" />
      <path {...iconStrokeProps()} d="M8.5 7.5V5h7v2.5" />
      <path {...iconStrokeProps()} d="M8 12h8" />
    </svg>
  );
}

function SkillsGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...iconStrokeProps()} d="m7 9 5-4 5 4-5 4-5-4Z" />
      <path {...iconStrokeProps()} d="m7 15 5 4 5-4" />
    </svg>
  );
}

function ExperienceGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...iconStrokeProps()} d="M6.5 6.5h11v11h-11z" />
      <path {...iconStrokeProps()} d="M9 10h6" />
      <path {...iconStrokeProps()} d="M9 13h4" />
    </svg>
  );
}

function EducationGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...iconStrokeProps()} d="m12 5 8 4-8 4-8-4 8-4Z" />
      <path {...iconStrokeProps()} d="M7 11v4c0 1.2 2.2 3 5 3s5-1.8 5-3v-4" />
    </svg>
  );
}

function AchievementsGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...iconStrokeProps()} d="M9 4.5h6v4a3 3 0 0 1-6 0v-4Z" />
      <path {...iconStrokeProps()} d="M10 15.5 12 13l2 2.5" />
      <path {...iconStrokeProps()} d="M9 16.5h6v3H9z" />
    </svg>
  );
}

function ContactGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...iconStrokeProps()} d="M5.5 7.5h13v9h-13z" />
      <path {...iconStrokeProps()} d="m6.5 8.5 5.5 4 5.5-4" />
    </svg>
  );
}

const APP_GLYPHS: Record<AppId, (props: IconProps) => ReactElement> = {
  about: AboutGlyph,
  projects: ProjectsGlyph,
  skills: SkillsGlyph,
  experience: ExperienceGlyph,
  education: EducationGlyph,
  achievements: AchievementsGlyph,
  contact: ContactGlyph,
};

export function AppGlyph({ appId, className }: { appId: AppId; className?: string }) {
  const Glyph = APP_GLYPHS[appId];
  return <Glyph className={className} />;
}
