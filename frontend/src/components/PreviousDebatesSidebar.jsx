// debate-ui/src/components/PreviousDebatesSidebar.jsx

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Sparkles } from 'lucide-react';

const DUMMY_USER_ID = '8f3c2e7b-6b4a-4c9a-9e6f-2d5c1a8f7e42';

const KICKER =
  'text-[11px] font-semibold uppercase leading-tight tracking-[0.18em] text-ap-muted';

function PreviousDebatesSidebar({ isOpen, onClose, onSelectDebate }) {
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) fetchDebates();
  }, [isOpen]);

  const fetchDebates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/user/${DUMMY_USER_ID}/history?limit=20`
      );
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setDebates(data.debates || []);
    } catch {
      setError('Failed to load previous debates');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeDebate = (debate) => {
    onSelectDebate({
      sessionId: debate.session_id,
      topic: debate.topic,
      difficulty: debate.difficulty,
      isResume: true,
    });
    onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown date';
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (ended_at, performance) => {
    if (!ended_at) return 'var(--color-ap-mint)';
    if (performance === 'excellent') return 'var(--color-ap-mint)';
    if (performance === 'good') return 'var(--color-ap-blue)';
    if (performance === 'fair') return 'var(--color-ap-gold)';
    return 'var(--color-ap-muted)';
  };

  const getStatusText = (ended_at, performance) => {
    if (!ended_at) return 'Active';
    if (!performance) return 'Completed';
    return performance.charAt(0).toUpperCase() + performance.slice(1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-[5px]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 240 }}
            className="fixed right-0 top-0 z-[80] flex h-full w-full max-w-[420px] flex-col overflow-hidden border-l border-ap-line bg-ap-bg font-sans text-ap-ink max-[480px]:max-w-full"
          >
            {/* Header */}
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-ap-line px-5 pb-[18px] pt-[22px]">
              <div>
                <span className={KICKER}>Your history</span>
                <h2 className="mt-2 text-2xl font-bold leading-none tracking-[-0.035em]">
                  Previous debates
                </h2>
                <p className="mt-1.5 text-[11px] text-ap-muted">
                  {debates.length} session{debates.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close history"
                className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-ap-sm border border-ap-line bg-transparent text-ap-ink transition-colors hover:border-ap-line-strong hover:bg-ap-ink/5"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-4">
              {loading ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-ap-muted">
                  <span className="h-[34px] w-[34px] animate-spin rounded-full border-2 border-ap-line border-t-ap-ink" />
                  <p>Loading debates…</p>
                </div>
              ) : error ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <p className="text-sm text-ap-danger">{error}</p>
                  <button
                    type="button"
                    onClick={fetchDebates}
                    className="inline-flex h-[38px] items-center justify-center gap-2 rounded-ap border border-transparent bg-ap-accent px-4 text-sm font-semibold text-ap-accent-ink transition hover:bg-ap-accent/85"
                  >
                    Retry
                  </button>
                </div>
              ) : debates.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2.5 text-center">
                  <div className="mb-1 inline-flex h-12 w-12 items-center justify-center rounded-ap-sm border border-ap-line bg-ap-surface-2 text-ap-muted">
                    <MessageSquare size={24} />
                  </div>
                  <p className="text-[15px] font-semibold text-ap-ink">No debates yet</p>
                  <p className="max-w-[28ch] text-sm leading-relaxed text-ap-muted">
                    Start your first debate to see your history here
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {debates.map((debate, index) => {
                    const statusColor = getStatusColor(
                      debate.ended_at,
                      debate.performance
                    );
                    return (
                      <motion.div
                        key={debate.session_id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group cursor-pointer rounded-ap border border-ap-line bg-ap-surface p-3.5 transition hover:-translate-y-px hover:border-ap-line-strong"
                        onClick={() => handleResumeDebate(debate)}
                      >
                        <div className="flex items-center justify-between gap-2.5">
                          <span
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold"
                            style={{ color: statusColor }}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {getStatusText(debate.ended_at, debate.performance)}
                          </span>
                          <span className="text-[11px] text-ap-muted">
                            {formatDate(debate.started_at)}
                          </span>
                        </div>

                        <p className="mt-2.5 line-clamp-2 text-[15px] font-semibold leading-snug tracking-[-0.015em] text-ap-ink">
                          {debate.topic}
                        </p>

                        <div className="mt-2.5 flex items-center justify-between gap-2.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex h-6 items-center rounded-ap-sm border border-ap-line px-2.5 text-[11px] font-semibold capitalize text-ap-ink-soft">
                              {debate.difficulty || 'standard'}
                            </span>
                            <span className="text-[11px] text-ap-muted">
                              {debate.total_turns ?? 0} turn
                              {(debate.total_turns ?? 0) !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ap-ink opacity-0 transition-opacity group-hover:opacity-100">
                            Resume <Sparkles size={11} />
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default PreviousDebatesSidebar;
