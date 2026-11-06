// debate-ui/src/components/NameSetupModal.jsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

const DUMMY_USER_ID = '8f3c2e7b-6b4a-4c9a-9e6f-2d5c1a8f7e42';

export default function NameSetupModal({ isOpen, onComplete }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a name');
      return;
    }
    if (trimmed.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/user/${DUMMY_USER_ID}/update`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: trimmed }),
        }
      );
      if (!res.ok) throw new Error('Failed to save');
      onComplete(trimmed);
    } catch {
      setError('Could not save name. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[8px]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="clay pointer-events-auto w-full max-w-[420px] p-6 font-sans text-ap-ink sm:p-8">
              <div className="clay-panel-sm relative mb-5 inline-flex h-16 w-16 items-center justify-center text-2xl font-bold tracking-[-0.03em] text-ap-panel-ink">
                {name.trim().charAt(0).toUpperCase() || '?'}
                <span className="clay-accent absolute -right-[7px] -top-[7px] inline-flex h-6 w-6 items-center justify-center text-ap-accent-ink">
                  <Sparkles size={13} />
                </span>
              </div>

              <span className="text-[11px] font-semibold uppercase leading-tight tracking-[0.18em] text-ap-muted">
                One last thing
              </span>
              <h2 className="mt-2.5 text-3xl font-bold leading-[1.02] tracking-[-0.035em] sm:text-4xl">
                What should we call you?
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-ap-ink-soft">
                We'll use this to personalize your experience.
              </p>

              <div className="mt-6 flex flex-col gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  onKeyDown={handleKey}
                  placeholder="Enter your name…"
                  maxLength={50}
                  autoFocus
                  className={`clay-inset h-[46px] w-full px-3.5 text-base font-medium text-ap-ink outline-none transition-colors placeholder:text-ap-muted focus:bg-ap-surface ${
                    error
                      ? 'border-ap-danger'
                      : 'border-ap-line focus:border-ap-line-strong'
                  }`}
                />
                {error && <p className="text-sm text-ap-danger">{error}</p>}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="clay-btn clay-btn-accent mt-4 inline-flex h-12 w-full items-center justify-center gap-2 px-5 text-[15px] font-semibold leading-none text-ap-accent-ink hover:bg-ap-accent/85 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  'Saving…'
                ) : (
                  <>
                    Let's go
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
