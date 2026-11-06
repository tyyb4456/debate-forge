// debate-ui/src/components/NameSetupModal.jsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

const INK = 'var(--clay-ink)';
const INK_SOFT = 'var(--clay-ink-soft)';
const MUTED = 'var(--clay-muted)';
const DUMMY_USER_ID = '8f3c2e7b-6b4a-4c9a-9e6f-2d5c1a8f7e42';

export default function NameSetupModal({ isOpen, onComplete }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('Please enter a name'); return; }
    if (trimmed.length < 2) { setError('Name must be at least 2 characters'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/user/${DUMMY_USER_ID}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmed }),
      });
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
            className="fixed inset-0 z-50"
            style={{ backgroundColor: 'rgba(11,17,32,0.55)', backdropFilter: 'blur(8px)' }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ pointerEvents: 'none' }}
          >
            <div className="clay-card w-full max-w-sm p-7 sm:p-8 flex flex-col gap-6" style={{ pointerEvents: 'all' }}>
              <div className="flex justify-center">
                <div className="clay-avatar w-20 h-20 text-3xl font-display relative">
                  {name.trim().charAt(0).toUpperCase() || '?'}
                  <span className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'var(--avatar-soft-bg)', boxShadow: 'var(--shadow-clay-sm)' }}>
                    <Sparkles size={13} style={{ color: 'var(--clay-primary)' }} />
                  </span>
                </div>
              </div>

              <div className="text-center">
                <h2 className="font-display text-2xl sm:text-3xl leading-tight" style={{ color: INK }}>
                  What's your name?
                </h2>
                <p className="text-sm mt-2" style={{ color: MUTED, fontFamily: 'inherit' }}>
                  We'll use this to personalize your experience.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  onKeyDown={handleKey}
                  placeholder="Enter your name…"
                  maxLength={50}
                  autoFocus
                  className="clay-input px-4 py-3.5 text-base"
                  style={error ? { boxShadow: 'inset 0 0 0 2px color-mix(in srgb, var(--clay-danger) 55%, transparent)' } : undefined}
                />
                {error && (
                  <p className="text-xs" style={{ color: 'var(--clay-danger)', fontFamily: 'inherit' }}>
                    {error}
                  </p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="clay-btn w-full py-3.5 text-sm font-bold uppercase tracking-[0.08em]"
              >
                {loading ? 'Saving…' : (
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
