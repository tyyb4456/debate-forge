// debate-ui/src/App.jsx  (replace existing file)
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';

const Debate = lazy(() => import('./pages/Debate'));
const Profile = lazy(() => import('./pages/Profile'));

function RouteFallback() {
  return (
    <div
      className="grid min-h-svh place-items-center bg-ap-bg font-sans text-sm text-ap-muted"
      aria-busy="true"
      aria-live="polite"
    >
      Loading…
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/debate/:sessionId" element={<Debate />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;