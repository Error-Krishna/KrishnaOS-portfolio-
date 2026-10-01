import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { getHealth } from '@/lib/apiClient';
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
  // Warm-up ping: free-tier backends sleep when idle and take a while to
  // wake. Poking /api/health the moment the page loads means the server is
  // already waking while the visitor watches the boot sequence, so it's
  // usually ready by the time any window or Recruiter Mode needs it.
  // Fire-and-forget — the result is intentionally ignored.
  useEffect(() => {
    void getHealth();
  }, []);

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
