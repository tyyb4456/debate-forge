// debate-ui/src/components/PreviousDebatesSidebar.jsx

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Sparkles } from 'lucide-react';

const PRIMARY = 'var(--clay-primary)';
const INK = 'var(--clay-ink)';
const INK_SOFT = 'var(--clay-ink-soft)';
const MUTED = 'var(--clay-muted)';
const DUMMY_USER_ID = '8f3c2e7b-6b4a-4c9a-9e6f-2d5c1a8f7e42';

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
      const response = await fetch(`http://127.0.0.1:8000/api/user/${DUMMY_USER_ID}/history?limit=20`);
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
    if (!ended_at) return 'var(--clay-mint)';
    if (performance === 'excellent') return 'var(--clay-mint)';
    if (performance === 'good') return 'var(--clay-blue)';
    if (performance === 'fair') return 'var(--clay-gold)';
    return MUTED;
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
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(11,17,32,0.5)', backdropFilter: 'blur(6px)' }}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 240 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col overflow-hidden clay-bg"
          >
            {/* Header */}
            <div className="shrink-0 p-4 pb-2">
              <div className="clay-card-primary px-5 py-4 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl leading-none" style={{ color: 'var(--clay-on-primary)' }}>History</h2>
                  <p className="text-[11px] mt-1.5" style={{ color: 'var(--clay-on-primary)', opacity: 0.65 }}>
                    {debates.length} session{debates.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.08, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--clay-on-primary) 16%, transparent)',
                    color: 'var(--clay-on-primary)',
                    border: '1px solid color-mix(in srgb, var(--clay-on-primary) 20%, transparent)',
                  }}
                >
                  <X size={18} />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-10 h-10 rounded-full border-4"
                    style={{ borderColor: 'var(--clay-bg-deep)', borderTopColor: PRIMARY }}
                  />
                  <p className="text-sm" style={{ color: INK_SOFT }}>Loading debates…</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <p className="text-sm" style={{ color: 'var(--clay-danger)' }}>{error}</p>
                  <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={fetchDebates} className="clay-btn px-5 py-2.5 text-sm font-semibold">
                    Retry
                  </motion.button>
                </div>
              ) : debates.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="clay-avatar w-16 h-16">
                    <MessageSquare size={24} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: INK }}>No debates yet</p>
                  <p className="text-xs text-center max-w-[220px]" style={{ color: MUTED }}>
                    Start your first debate to see your history here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {debates.map((debate, index) => (
                    <motion.div
                      key={debate.session_id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="clay-card-sm p-4 cursor-pointer group transition-all hover:-translate-y-0.5"
                      onClick={() => handleResumeDebate(debate)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: getStatusColor(debate.ended_at, debate.performance),
                              boxShadow: `0 0 0 4px color-mix(in srgb, ${getStatusColor(debate.ended_at, debate.performance)} 18%, transparent)`,
                            }}
                          />
                          <span className="text-[11px] font-semibold" style={{ color: INK_SOFT }}>
                            {getStatusText(debate.ended_at, debate.performance)}
                          </span>
                        </div>
                        <span className="text-[11px]" style={{ color: MUTED }}>
                          {formatDate(debate.started_at)}
                        </span>
                      </div>

                      <p className="font-semibold text-sm mb-2.5 line-clamp-2" style={{ color: INK }}>
                        {debate.topic}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize"
                            style={{ backgroundColor: 'var(--clay-bg)', color: PRIMARY }}
                          >
                            {debate.difficulty || 'standard'}
                          </span>
                          <span className="text-[11px]" style={{ color: MUTED }}>
                            {debate.total_turns ?? 0} turn{(debate.total_turns ?? 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1" style={{ color: PRIMARY }}>
                          Resume <Sparkles size={11} />
                        </span>
                      </div>
                    </motion.div>
                  ))}
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
