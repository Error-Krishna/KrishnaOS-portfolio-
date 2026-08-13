import { Routes, Route } from 'react-router-dom';
import { OsRoot } from './OsRoot';
import { RecruiterRoot } from '@/recruiter/RecruiterRoot';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<OsRoot />} />
      <Route path="/recruiter" element={<RecruiterRoot />} />
      {/* Deep-linkable app routes (e.g. /projects) can be added here in
          Phase 4 if direct-linking into a specific window is desired. */}
    </Routes>
  );
}
