// debate-ui/src/pages/Profile.jsx

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  BarChart2,
  Calendar,
  Flame,
  Star,
  Award,
  Brain,
  BookOpen,
  ChevronRight,
  Pencil,
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const PRIMARY = 'var(--clay-primary)';
const INK = 'var(--clay-ink)';
const INK_SOFT = 'var(--clay-ink-soft)';
const MUTED = 'var(--clay-muted)';
const DUMMY_USER_ID = '8f3c2e7b-6b4a-4c9a-9e6f-2d5c1a8f7e42';
const BASE = 'http://127.0.0.1:8000/api/user';

// ─── Badge icon map ───────────────────────────────────────────────────────────
const BADGE_ICONS = {
  'Fallacy Hunter': { icon: Target, color: 'var(--clay-gold)' },
  'Open Mind': { icon: Brain, color: 'var(--clay-primary)' },
  'Depth Seeker': { icon: BookOpen, color: 'var(--clay-blue)' },
  'Marathon Debater': { icon: Flame, color: 'var(--clay-peach)' },
  default: { icon: Award, color: 'var(--clay-mint)' },
};

function getBadgeConfig(name) {
  return BADGE_ICONS[name] || BADGE_ICONS.default;
}

// ─── Tiny bar chart ───────────────────────────────────────────────────────────
function MiniBarChart({ data }) {
  if (!data || data.length === 0)
    return (
      <p className="text-sm" style={{ color: MUTED, fontFamily: 'inherit' }}>
        Not enough data yet.
      </p>
    );

  const validData = data.filter((d) => d.argument_strength != null);
  if (validData.length === 0)
    return (
      <p className="text-sm" style={{ color: MUTED, fontFamily: 'inherit' }}>
        No strength data recorded yet.
      </p>
    );

  const maxVal = Math.max(...data.map((d) => d.argument_strength || 0), 1);
  const CHART_HEIGHT = 88;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '7px', height: `${CHART_HEIGHT}px` }}>
      {data.map((d, i) => {
        const strength = d.argument_strength;
        const barHeight = strength != null ? Math.max((strength / maxVal) * CHART_HEIGHT, 5) : 7;

        const perf = d.performance;
        const color =
          perf === 'excellent' ? 'var(--clay-mint)' :
          perf === 'good'      ? 'var(--clay-blue)' :
          perf === 'fair'      ? 'var(--clay-gold)' :
          perf === 'poor'      ? 'var(--clay-peach)' :
          'var(--clay-bg-deep)';

        return (
          <div
            key={i}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative' }}
            className="group"
          >
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginBottom: '8px',
                backgroundColor: 'var(--tooltip-bg)',
                borderRadius: '12px',
                padding: '6px 10px',
                fontSize: '11px',
                color: INK,
                boxShadow: '0 8px 24px rgba(17,24,39,0.28)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                opacity: 0,
                transition: 'opacity 0.15s',
                zIndex: 10,
                fontFamily: 'inherit',
              }}
              className="group-hover:opacity-100"
            >
              {d.topic?.length > 20 ? d.topic.slice(0, 20) + '…' : d.topic}
              <br />
              {strength != null ? `Strength: ${strength.toFixed(1)}` : 'No data'}
            </div>

            <div
              style={{
                width: '100%',
                height: `${barHeight}px`,
                backgroundColor: strength != null ? color : 'var(--clay-bg-deep)',
                borderRadius: '8px 8px 4px 4px',
                transition: 'height 0.6s ease',
                boxShadow: strength != null ? '2px 2px 7px rgba(17,24,39,0.22)' : 'none',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, accent = PRIMARY }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="clay-card-sm p-6 flex flex-col gap-2.5"
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: MUTED, fontFamily: 'inherit' }}>
          {label}
        </p>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--clay-bg)' }}
        >
          <Icon size={15} style={{ color: accent }} />
        </div>
      </div>
      <p className="text-3xl font-display leading-none" style={{ color: INK }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs" style={{ color: MUTED, fontFamily: 'inherit' }}>
          {sub}
        </p>
      )}
    </motion.div>
  );
}

// ─── Skill ring ───────────────────────────────────────────────────────────────
function SkillRing({ skill = 0.5, label = 'Intermediate' }) {
  const pct = Math.round(skill * 100);
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="color-mix(in srgb, var(--clay-on-primary) 22%, transparent)" strokeWidth="10" />
          <motion.circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="var(--clay-on-primary)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-display leading-none" style={{ color: 'var(--clay-on-primary)' }}>{pct}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ fontFamily: 'inherit', color: 'var(--clay-on-primary)', opacity: 0.55 }}>
            /100
          </span>
        </div>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] px-3 py-1.5 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--clay-on-primary) 16%, transparent)', color: 'var(--clay-on-primary)', fontFamily: 'inherit' }}>
        {label}
      </span>
    </div>
  );
}

// ─── Performance donut ────────────────────────────────────────────────────────
function PerfBreakdown({ breakdown }) {
  const entries = [
    { key: 'excellent', color: 'var(--clay-mint)', label: 'Excellent' },
    { key: 'good', color: 'var(--clay-blue)', label: 'Good' },
    { key: 'fair', color: 'var(--clay-gold)', label: 'Fair' },
    { key: 'poor', color: 'var(--clay-peach)', label: 'Poor' },
  ];
  const total = entries.reduce((s, e) => s + (breakdown[e.key] || 0), 0);
  if (total === 0)
    return (
      <p className="text-sm" style={{ color: MUTED, fontFamily: 'inherit' }}>
        No completed debates yet.
      </p>
    );

  return (
    <div className="flex flex-col gap-3 w-full">
      {entries.map(({ key, color, label }) => {
        const val = breakdown[key] || 0;
        const pct = total > 0 ? Math.round((val / total) * 100) : 0;
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="text-xs w-16 font-semibold" style={{ color: INK_SOFT, fontFamily: 'inherit' }}>
              {label}
            </span>
            <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--clay-bg-deep)' }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ backgroundColor: color }}
              />
            </div>
            <span className="text-xs w-8 text-right font-bold" style={{ color: INK, fontFamily: 'inherit' }}>
              {val}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Trend icon ───────────────────────────────────────────────────────────────
function TrendIcon({ trend }) {
  if (trend === 'improving') return <TrendingUp size={17} style={{ color: 'var(--clay-mint)' }} />;
  if (trend === 'declining') return <TrendingDown size={17} style={{ color: 'var(--clay-danger)' }} />;
  return <Minus size={17} style={{ color: MUTED }} />;
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE}/${DUMMY_USER_ID}/profile`);
        if (!res.ok) throw new Error(`${res.status}`);
        setProfile(await res.json());
      } catch {
        setError('Could not load profile. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center clay-bg">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--clay-bg-deep)', borderTopColor: PRIMARY }}
          />
          <p style={{ color: INK_SOFT, fontFamily: 'inherit' }}>Loading profile…</p>
        </div>
      </div>
    );

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center p-8 clay-bg">
        <div className="clay-card text-center max-w-sm p-8">
          <div className="clay-avatar w-14 h-14 mx-auto mb-5 text-xl font-display">!</div>
          <p className="font-display text-3xl mb-3" style={{ color: INK }}>Oops</p>
          <p style={{ color: INK_SOFT, fontFamily: 'inherit' }}>{error}</p>
          <button
            onClick={() => navigate('/')}
            className="clay-btn mt-6 px-6 py-3 text-sm font-bold uppercase tracking-wider"
          >
            Go home
          </button>
        </div>
      </div>
    );

  const { user, stats, achievements, recent_debates, growth_trajectory } = profile;
  const tabs = ['overview', 'achievements', 'history'];

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setSavingName(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/user/${DUMMY_USER_ID}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmed }),
      });
      if (res.ok) {
        setProfile((prev) => ({
          ...prev,
          user: { ...prev.user, username: trimmed },
        }));
        setEditingName(false);
      }
    } finally {
      setSavingName(false);
    }
  };

  return (
    <div className="min-h-screen clay-bg" style={{ fontFamily: 'inherit' }}>
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10"
        >
          <button onClick={() => navigate('/')} className="clay-btn-soft px-4 py-2.5 text-sm font-semibold" style={{ color: INK_SOFT }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="font-display text-2xl sm:text-3xl" style={{ color: INK }}>
            Profile
          </h1>
          <ThemeToggle />
        </motion.div>

        {/* ── Hero card ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="clay-card-primary p-6 sm:p-9 mb-8 flex flex-col sm:flex-row items-center sm:items-center gap-6"
        >
          <div
            className="w-20 h-20 rounded-[24px] flex items-center justify-center shrink-0 text-4xl font-display"
            style={{
              background: 'color-mix(in srgb, var(--clay-on-primary) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--clay-on-primary) 18%, transparent)',
              color: 'var(--clay-on-primary)',
              boxShadow: 'inset 1px 1px 2px color-mix(in srgb, var(--clay-on-primary) 12%, transparent)',
            }}
          >
            {(user.username || 'D').charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            {editingName ? (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') setEditingName(false);
                  }}
                  className="px-3 py-2 rounded-xl text-sm font-semibold outline-none"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--clay-on-primary) 12%, transparent)',
                    color: 'var(--clay-on-primary)',
                    border: '1px solid color-mix(in srgb, var(--clay-on-primary) 24%, transparent)',
                    fontFamily: 'inherit',
                    width: '180px',
                  }}
                  maxLength={50}
                />
                <button
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="px-3 py-2 rounded-xl text-xs font-bold uppercase"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--clay-on-primary) 20%, transparent)',
                    color: 'var(--clay-on-primary)',
                  }}
                >
                  {savingName ? '…' : 'Save'}
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="px-3 py-2 rounded-xl text-xs font-bold uppercase"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--clay-on-primary) 8%, transparent)',
                    color: 'var(--clay-on-primary)',
                    opacity: 0.7,
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <p className="text-2xl sm:text-3xl font-display truncate" style={{ color: 'var(--clay-on-primary)' }}>
                  {user.username || 'Debater'}
                </p>
                <button
                  onClick={() => {
                    setNameInput(user.username || '');
                    setEditingName(true);
                  }}
                  className="opacity-60 hover:opacity-100 transition-opacity"
                  title="Edit name"
                >
                  <Pencil size={15} color="var(--clay-on-primary)" />
                </button>
              </div>
            )}
            <p className="text-sm mt-1.5" style={{ color: 'var(--clay-on-primary)', opacity: 0.72 }}>
              {user.email || 'Anonymous User'}
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--clay-on-primary)', opacity: 0.5 }}>
              Member since{' '}
              {new Date(user.member_since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="shrink-0">
            <SkillRing skill={user.current_skill_level} label={user.skill_label} />
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <div className="clay-inset p-2 flex gap-2 rounded-full mb-8">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className="flex-1 py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-[0.12em] transition-all"
              style={{
                fontFamily: 'inherit',
                background: activeTab === t ? 'var(--clay-grad-primary)' : 'transparent',
                color: activeTab === t ? 'var(--clay-on-primary)' : 'var(--clay-ink-soft)',
                boxShadow: activeTab === t ? 'var(--shadow-primary)' : 'none',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ══════════════ OVERVIEW TAB ══════════════ */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
                <StatCard label="Total Debates" value={stats.total_debates} icon={BarChart2} />
                <StatCard label="Completed" value={stats.completed_debates} icon={Trophy} accent="var(--clay-mint)" />
                <StatCard
                  label="Avg Strength"
                  value={stats.avg_argument_strength > 0 ? stats.avg_argument_strength.toFixed(1) : '–'}
                  sub="out of 10"
                  icon={Zap}
                  accent="var(--clay-gold)"
                />
                <StatCard
                  label="Fallacies"
                  value={stats.total_fallacies}
                  sub={`${stats.avg_fallacies_per_debate.toFixed(1)} per debate`}
                  icon={Target}
                  accent="var(--clay-peach)"
                />
              </div>

                <div className="grid sm:grid-cols-2 gap-6">
                <div className="clay-card p-5 sm:p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-4" style={{ color: MUTED }}>
                    Performance breakdown
                  </p>
                  <PerfBreakdown breakdown={stats.performance_breakdown} />
                </div>

                <div className="clay-card p-5 sm:p-6 flex flex-col gap-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: MUTED }}>
                    Skill trend
                  </p>
                  <div className="flex items-center gap-3">
                    <TrendIcon trend={stats.skill_trend} />
                    <span className="text-xl font-display capitalize" style={{ color: INK }}>
                      {stats.skill_trend === 'insufficient_data'
                        ? 'Not enough data yet'
                        : stats.skill_trend.charAt(0).toUpperCase() + stats.skill_trend.slice(1)}
                    </span>
                    {stats.improvement_percentage != null && (
                      <span
                        className="text-sm font-bold ml-auto"
                        style={{
                          color:
                            stats.improvement_percentage > 0
                              ? 'var(--clay-mint)'
                              : stats.improvement_percentage < 0
                              ? 'var(--clay-danger)'
                              : MUTED,
                        }}
                      >
                        {stats.improvement_percentage > 0 ? '+' : ''}
                        {stats.improvement_percentage}%
                      </span>
                    )}
                  </div>
                  <div className="text-sm flex gap-4" style={{ color: INK_SOFT }}>
                    <span>
                      Preferred:{' '}
                      <strong style={{ color: PRIMARY }}>
                        {stats.preferred_difficulty
                          ? stats.preferred_difficulty.charAt(0).toUpperCase() + stats.preferred_difficulty.slice(1)
                          : '–'}
                      </strong>
                    </span>
                  </div>
                  <p className="text-xs mt-auto" style={{ color: MUTED }}>
                    {achievements.total} achievement{achievements.total !== 1 ? 's' : ''} earned
                  </p>
                </div>
              </div>

              <div className="clay-card p-5 sm:p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-5" style={{ color: MUTED }}>
                  Argument strength over time
                </p>
                <MiniBarChart data={growth_trajectory} />
                <p className="text-[11px] mt-4 text-right" style={{ color: MUTED }}>
                  Each bar = one completed debate
                </p>
              </div>
            </motion.div>
          )}

          {/* ══════════════ ACHIEVEMENTS TAB ══════════════ */}
          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {achievements.list.length === 0 ? (
                <div className="clay-card p-12 flex flex-col items-center gap-4 text-center">
                  <div className="clay-inset w-16 h-16 flex items-center justify-center">
                    <Star size={26} style={{ color: 'var(--clay-gold)' }} />
                  </div>
                  <p className="text-xl font-display" style={{ color: INK }}>No achievements yet</p>
                  <p className="text-sm max-w-xs" style={{ color: MUTED }}>
                    Complete debates to earn badges. Try debating with few fallacies or going deep on a topic!
                  </p>
                  <button onClick={() => navigate('/')} className="clay-btn mt-2 px-5 py-3 text-sm font-bold uppercase tracking-wider">
                    Start a debate
                  </button>
                </div>
              ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                  {achievements.list.map((a, i) => {
                    const cfg = getBadgeConfig(a.badge_name);
                    const Icon = cfg.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="clay-card-sm p-5 flex gap-4 items-start"
                      >
                        <div className="clay-inset w-12 h-12 flex items-center justify-center shrink-0">
                          <Icon size={22} style={{ color: cfg.color }} />
                        </div>
                        <div>
                          <p className="font-display text-base" style={{ color: INK }}>{a.badge_name}</p>
                          <p className="text-xs mt-1" style={{ color: INK_SOFT }}>{a.description}</p>
                          <p className="text-[11px] mt-2 flex items-center gap-1" style={{ color: MUTED }}>
                            <Calendar size={11} />
                            {new Date(a.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ══════════════ HISTORY TAB ══════════════ */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {recent_debates.length === 0 ? (
                <div className="clay-card p-12 text-center">
                  <p className="text-xl font-display" style={{ color: MUTED }}>No debates yet</p>
                </div>
              ) : (
                recent_debates.map((d, i) => {
                  const isActive = !d.ended_at;
                  const perfColor =
                    d.performance === 'excellent' ? 'var(--clay-mint)' :
                    d.performance === 'good'      ? 'var(--clay-blue)' :
                    d.performance === 'fair'      ? 'var(--clay-gold)' :
                    isActive                      ? 'var(--clay-mint)' :
                    MUTED;

                  return (
                    <motion.div
                      key={d.session_id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() =>
                        navigate(`/debate/${d.session_id}`, {
                          state: { topic: d.topic, difficulty: d.difficulty, isResume: true },
                        })
                      }
                      className="clay-card-sm p-4 sm:p-5 flex items-center gap-4 cursor-pointer transition-all hover:-translate-y-0.5"
                    >
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: perfColor, boxShadow: `0 0 0 4px color-mix(in srgb, ${perfColor} 18%, transparent)` }} />

                      <div className="flex-1 min-w-0">
                        <p className="font-display text-base truncate" style={{ color: INK }}>{d.topic}</p>
                        <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold capitalize" style={{ backgroundColor: 'var(--clay-bg)', color: INK_SOFT }}>
                            {d.difficulty}
                          </span>
                          {isActive ? (
                            <span className="text-[11px] font-semibold" style={{ color: 'var(--clay-mint)' }}>● Active</span>
                          ) : (
                            d.performance && (
                              <span className="text-[11px] font-semibold capitalize" style={{ color: perfColor }}>
                                {d.performance}
                              </span>
                            )
                          )}
                          <span className="text-[11px]" style={{ color: MUTED }}>
                            {new Date(d.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {d.avg_argument_strength != null && (
                        <div className="text-right shrink-0">
                          <p className="text-2xl font-display leading-none" style={{ color: INK }}>{d.avg_argument_strength.toFixed(1)}</p>
                          <p className="text-[10px] mt-1" style={{ color: MUTED }}>strength</p>
                        </div>
                      )}
                      <ChevronRight size={17} style={{ color: MUTED }} />
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
