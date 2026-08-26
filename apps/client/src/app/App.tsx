import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { OsRoot } from './OsRoot';

const RecruiterRoot = lazy(
  () =>
    import('@/recruiter/RecruiterRoot').then((module) => ({
      default: module.RecruiterRoot,
    })),
);

function RouteLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
        Loading…
      </p>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<OsRoot />} />

      <Route
        path="/recruiter"
        element={
          <Suspense fallback={<RouteLoading />}>
            <RecruiterRoot />
          </Suspense>
        }
      />
    </Routes>
  );
}
