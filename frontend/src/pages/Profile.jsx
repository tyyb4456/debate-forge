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

const PRIMARY = 'var(--color-ap-ink)';
const MUTED = 'var(--color-ap-muted)';
const DUMMY_USER_ID = '8f3c2e7b-6b4a-4c9a-9e6f-2d5c1a8f7e42';
const BASE = 'http://127.0.0.1:8000/api/user';

const KICKER =
  'text-[11px] font-semibold uppercase leading-tight tracking-[0.18em] text-ap-muted';

const BTN =
  'inline-flex items-center justify-center gap-2 rounded-ap border border-transparent bg-ap-accent px-5 font-semibold leading-none text-ap-accent-ink transition hover:-translate-y-px hover:bg-ap-accent/85 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50';

const BTN_GHOST =
  'inline-flex items-center justify-center gap-2 rounded-ap border border-ap-line px-4 font-medium leading-none text-ap-ink transition hover:-translate-y-px hover:border-ap-line-strong hover:bg-ap-ink/5 disabled:cursor-not-allowed disabled:opacity-50';

// ─── Badge icon map ───────────────────────────────────────────────────────────
const BADGE_ICONS = {
  'Fallacy Hunter': { icon: Target, color: 'var(--color-ap-gold)' },
  'Open Mind': { icon: Brain, color: 'var(--color-ap-ink)' },
  'Depth Seeker': { icon: BookOpen, color: 'var(--color-ap-blue)' },
  'Marathon Debater': { icon: Flame, color: 'var(--color-ap-peach)' },
  default: { icon: Award, color: 'var(--color-ap-mint)' },
};

function getBadgeConfig(name) {
  return BADGE_ICONS[name] || BADGE_ICONS.default;
}

// ─── Tiny bar chart ───────────────────────────────────────────────────────────
function MiniBarChart({ data }) {
  if (!data || data.length === 0)
    return <p className="text-sm text-ap-muted">Not enough data yet.</p>;

  const validData = data.filter((d) => d.argument_strength != null);
  if (validData.length === 0)
    return <p className="text-sm text-ap-muted">No strength data recorded yet.</p>;

  const maxVal = Math.max(...data.map((d) => d.argument_strength || 0), 1);
  const CHART_HEIGHT = 88;

  return (
    <div className="flex items-end gap-[7px]" style={{ height: `${CHART_HEIGHT}px` }}>
      {data.map((d, i) => {
        const strength = d.argument_strength;
        const barHeight =
          strength != null ? Math.max((strength / maxVal) * CHART_HEIGHT, 5) : 7;

        const perf = d.performance;
        const color =
          perf === 'excellent'
            ? 'var(--color-ap-mint)'
            : perf === 'good'
              ? 'var(--color-ap-blue)'
              : perf === 'fair'
                ? 'var(--color-ap-gold)'
                : perf === 'poor'
                  ? 'var(--color-ap-peach)'
                  : 'var(--color-ap-line)';

        return (
          <div
            key={i}
            className="group relative flex h-full flex-1 items-end justify-center"
          >
            <div className="pointer-events-none absolute bottom-[calc(100%_+_8px)] left-1/2 z-[5] -translate-x-1/2 whitespace-nowrap rounded-ap-sm border border-ap-line bg-ap-panel px-2.5 py-1.5 text-[11px] leading-snug text-ap-panel-ink opacity-0 transition-opacity group-hover:opacity-100">
              {d.topic?.length > 20 ? d.topic.slice(0, 20) + '…' : d.topic}
              <br />
              {strength != null ? `Strength: ${strength.toFixed(1)}` : 'No data'}
            </div>

            <div
              className="w-full max-w-[44px] rounded-t-[2px] transition-[height] duration-500"
              style={{
                height: `${barHeight}px`,
                backgroundColor: strength != null ? color : 'var(--color-ap-line)',
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
      className="flex flex-col gap-2.5 rounded-ap border border-ap-line bg-ap-surface p-[18px]"
    >
      <div className="flex items-center justify-between gap-2">
        <p className={KICKER}>{label}</p>
        <div
          className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-ap-sm border border-ap-line"
          style={{ color: accent }}
        >
          <Icon size={14} />
        </div>
      </div>
      <p className="text-3xl font-bold leading-none tracking-[-0.045em] tabular-nums text-ap-ink">
        {value}
      </p>
      {sub && <p className="text-sm text-ap-muted">{sub}</p>}
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
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative h-[124px] w-[124px]">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={r}
            className="fill-none stroke-ap-panel-ink/20"
            strokeWidth="10"
          />
          <motion.circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="var(--color-ap-accent)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold leading-none tracking-[-0.04em] tabular-nums text-ap-panel-ink">
            {pct}
          </span>
          <span className="mt-1 text-[10px] font-semibold tracking-[0.12em] text-ap-panel-muted">
            /100
          </span>
        </div>
      </div>
      <span className="rounded-ap-sm border border-ap-panel-ink/20 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ap-panel-ink">
        {label}
      </span>
    </div>
  );
}

// ─── Performance donut ────────────────────────────────────────────────────────
function PerfBreakdown({ breakdown }) {
  const entries = [
    { key: 'excellent', color: 'var(--color-ap-mint)', label: 'Excellent' },
    { key: 'good', color: 'var(--color-ap-blue)', label: 'Good' },
    { key: 'fair', color: 'var(--color-ap-gold)', label: 'Fair' },
    { key: 'poor', color: 'var(--color-ap-peach)', label: 'Poor' },
  ];
  const total = entries.reduce((s, e) => s + (breakdown[e.key] || 0), 0);
  if (total === 0)
    return <p className="text-sm text-ap-muted">No completed debates yet.</p>;

  return (
    <div className="flex w-full flex-col gap-2.5">
      {entries.map(({ key, color, label }) => {
        const val = breakdown[key] || 0;
        const pct = total > 0 ? Math.round((val / total) * 100) : 0;
        return (
          <div key={key} className="flex items-center gap-2.5">
            <span className="w-[66px] shrink-0 text-sm font-medium text-ap-ink-soft">
              {label}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full border border-ap-line bg-ap-surface-2">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ backgroundColor: color }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-sm font-semibold tabular-nums text-ap-ink">
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
  if (trend === 'improving')
    return <TrendingUp size={17} style={{ color: 'var(--color-ap-mint)' }} />;
  if (trend === 'declining')
    return <TrendingDown size={17} style={{ color: 'var(--color-ap-danger)' }} />;
  return <Minus size={17} className="text-ap-muted" />;
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
      <div className="flex min-h-svh flex-col items-center justify-center gap-3.5 bg-ap-bg font-sans text-ap-ink">
        <span className="h-[34px] w-[34px] animate-spin rounded-full border-2 border-ap-line border-t-ap-ink" />
        <p className="text-sm text-ap-muted">Loading profile…</p>
      </div>
    );

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error)
    return (
      <div className="flex min-h-svh items-center justify-center bg-ap-bg p-6 font-sans text-ap-ink">
        <div className="w-full max-w-[380px] rounded-ap border border-ap-line bg-ap-surface p-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-ap-sm bg-ap-panel text-2xl font-bold text-ap-panel-ink">
            !
          </div>
          <p className="text-2xl font-bold tracking-[-0.035em]">Oops</p>
          <p className="mt-2.5 text-sm leading-relaxed text-ap-ink-soft">{error}</p>
          <button
            onClick={() => navigate('/')}
            className={`${BTN} mt-6 w-full`}
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
      const res = await fetch(
        `http://127.0.0.1:8000/api/user/${DUMMY_USER_ID}/update`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: trimmed }),
        }
      );
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
    <div className="min-h-svh bg-ap-bg pb-[72px] font-sans text-ap-ink selection:bg-ap-accent selection:text-ap-accent-ink">
      <header className="sticky top-0 z-20 border-b border-ap-line bg-ap-bg">
        <div className="mx-auto flex min-h-[68px] w-full max-w-[1120px] items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => navigate('/')}
              className={`${BTN_GHOST} h-[38px] px-3 text-sm text-ap-ink-soft`}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <span className="hidden h-6 w-px bg-ap-line sm:block" aria-hidden="true" />
            <button
              onClick={() => navigate('/')}
              className="hidden items-center gap-2.5 text-lg font-bold tracking-[-0.025em] text-ap-ink sm:inline-flex"
            >
              <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-ap-sm bg-ap-accent text-[13px] font-bold text-ap-accent-ink">
                D
              </span>
              DebateAI
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-ap-muted sm:inline">
              Profile
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1120px] px-5 pt-8 sm:px-8 sm:pt-12">
        {/* ── Hero card ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid overflow-hidden rounded-ap border border-ap-line bg-ap-surface min-[900px]:grid-cols-[minmax(0,1.55fr)_minmax(240px,0.75fr)]"
        >
          <div className="flex min-w-0 items-center gap-5 p-6 sm:p-9 max-[700px]:flex-col max-[700px]:items-start">
            <div className="inline-flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-ap-sm bg-ap-panel text-3xl font-bold tracking-[-0.03em] text-ap-panel-ink">
              {(user.username || 'D').charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <span className={KICKER}>Profile</span>

              {editingName ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') setEditingName(false);
                    }}
                    className="h-[38px] w-[190px] rounded-ap-sm border border-ap-line bg-ap-surface-2 px-3 text-sm font-semibold text-ap-ink outline-none transition-colors focus:border-ap-line-strong"
                    maxLength={50}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={savingName}
                    className={`${BTN} h-[38px] px-4 text-xs`}
                  >
                    {savingName ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditingName(false)}
                    className={`${BTN_GHOST} h-[38px] px-3 text-xs`}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="mt-1.5 flex min-w-0 items-center gap-2">
                  <h1 className="truncate text-2xl font-bold leading-tight tracking-[-0.035em] text-ap-ink sm:text-3xl max-[700px]:whitespace-normal">
                    {user.username || 'Debater'}
                  </h1>
                  <button
                    onClick={() => {
                      setNameInput(user.username || '');
                      setEditingName(true);
                    }}
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-ap-sm border border-transparent text-ap-muted transition-colors hover:border-ap-line hover:text-ap-ink"
                    title="Edit name"
                    aria-label="Edit name"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              )}

              <p className="mt-1.5 text-sm text-ap-ink-soft">
                {user.email || 'Anonymous User'}
              </p>
              <p className="mt-1 text-[11px] text-ap-muted">
                Member since{' '}
                {new Date(user.member_since).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center border-t border-ap-line bg-ap-panel p-6 text-ap-panel-ink min-[900px]:border-l min-[900px]:border-t-0">
            <SkillRing skill={user.current_skill_level} label={user.skill_label} />
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <div className="my-7 flex gap-1 rounded-ap border border-ap-line bg-ap-surface p-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`h-[38px] flex-1 rounded-ap-sm border border-transparent px-3 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors max-[480px]:px-1.5 max-[480px]:text-[10px] ${
                activeTab === t
                  ? 'bg-ap-panel text-ap-panel-ink'
                  : 'text-ap-muted hover:text-ap-ink'
              }`}
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
              className="flex flex-col gap-5"
            >
              <div className="grid grid-cols-2 gap-3 min-[900px]:grid-cols-4 max-[480px]:grid-cols-1">
                <StatCard
                  label="Total Debates"
                  value={stats.total_debates}
                  icon={BarChart2}
                />
                <StatCard
                  label="Completed"
                  value={stats.completed_debates}
                  icon={Trophy}
                  accent="var(--color-ap-mint)"
                />
                <StatCard
                  label="Avg Strength"
                  value={
                    stats.avg_argument_strength > 0
                      ? stats.avg_argument_strength.toFixed(1)
                      : '–'
                  }
                  sub="out of 10"
                  icon={Zap}
                  accent="var(--color-ap-gold)"
                />
                <StatCard
                  label="Fallacies"
                  value={stats.total_fallacies}
                  sub={`${stats.avg_fallacies_per_debate.toFixed(1)} per debate`}
                  icon={Target}
                  accent="var(--color-ap-peach)"
                />
              </div>

              <div className="grid gap-4 min-[900px]:grid-cols-2">
                <div className="rounded-ap border border-ap-line bg-ap-surface p-5">
                  <p className={`${KICKER} mb-4`}>Performance breakdown</p>
                  <PerfBreakdown breakdown={stats.performance_breakdown} />
                </div>

                <div className="flex flex-col rounded-ap border border-ap-line bg-ap-surface p-5">
                  <p className={`${KICKER} mb-4`}>Skill trend</p>
                  <div className="flex items-center gap-2.5">
                    <TrendIcon trend={stats.skill_trend} />
                    <span className="text-xl font-bold capitalize tracking-[-0.03em] text-ap-ink">
                      {stats.skill_trend === 'insufficient_data'
                        ? 'Not enough data yet'
                        : stats.skill_trend.charAt(0).toUpperCase() +
                          stats.skill_trend.slice(1)}
                    </span>
                    {stats.improvement_percentage != null && (
                      <span
                        className="ml-auto text-sm font-bold tabular-nums"
                        style={{
                          color:
                            stats.improvement_percentage > 0
                              ? 'var(--color-ap-mint)'
                              : stats.improvement_percentage < 0
                                ? 'var(--color-ap-danger)'
                                : MUTED,
                        }}
                      >
                        {stats.improvement_percentage > 0 ? '+' : ''}
                        {stats.improvement_percentage}%
                      </span>
                    )}
                  </div>
                  <div className="mt-3.5 flex flex-wrap gap-x-3.5 gap-y-1 text-sm text-ap-ink-soft">
                    <span>
                      Preferred:{' '}
                      <strong className="font-semibold text-ap-ink">
                        {stats.preferred_difficulty
                          ? stats.preferred_difficulty.charAt(0).toUpperCase() +
                            stats.preferred_difficulty.slice(1)
                          : '–'}
                      </strong>
                    </span>
                  </div>
                  <p className="mt-auto border-t border-ap-line pt-3.5 text-sm text-ap-muted">
                    {achievements.total} achievement
                    {achievements.total !== 1 ? 's' : ''} earned
                  </p>
                </div>
              </div>

              <div className="rounded-ap border border-ap-line bg-ap-surface p-5">
                <p className={`${KICKER} mb-4`}>Argument strength over time</p>
                <MiniBarChart data={growth_trajectory} />
                <p className="mt-3.5 text-right text-[11px] text-ap-muted">
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
                <div className="flex flex-col items-center gap-2.5 rounded-ap border border-ap-line bg-ap-surface px-6 py-14 text-center">
                  <div className="mb-1 inline-flex h-[52px] w-[52px] items-center justify-center rounded-ap-sm border border-ap-line bg-ap-surface-2 text-ap-gold">
                    <Star size={26} />
                  </div>
                  <p className="text-xl font-bold tracking-[-0.03em] text-ap-ink">
                    No achievements yet
                  </p>
                  <p className="max-w-[34ch] text-sm leading-relaxed text-ap-muted">
                    Complete debates to earn badges. Try debating with few fallacies
                    or going deep on a topic!
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className={`${BTN} mt-2 h-[38px] px-4 text-sm`}
                  >
                    Start a debate
                  </button>
                </div>
              ) : (
                <div className="grid gap-3.5 min-[900px]:grid-cols-2">
                  {achievements.list.map((a, i) => {
                    const cfg = getBadgeConfig(a.badge_name);
                    const Icon = cfg.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3.5 rounded-ap border border-ap-line bg-ap-surface p-[18px]"
                      >
                        <div
                          className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-ap-sm border border-ap-line bg-ap-surface-2"
                          style={{ color: cfg.color }}
                        >
                          <Icon size={22} />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-ap-ink">
                            {a.badge_name}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-ap-ink-soft">
                            {a.description}
                          </p>
                          <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-ap-muted">
                            <Calendar size={11} />
                            {new Date(a.earned_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
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
              className="flex flex-col gap-2.5"
            >
              {recent_debates.length === 0 ? (
                <div className="rounded-ap border border-ap-line bg-ap-surface px-6 py-14 text-center">
                  <p className="text-xl font-bold tracking-[-0.03em] text-ap-muted">
                    No debates yet
                  </p>
                </div>
              ) : (
                recent_debates.map((d, i) => {
                  const isActive = !d.ended_at;
                  const perfColor =
                    d.performance === 'excellent'
                      ? 'var(--color-ap-mint)'
                      : d.performance === 'good'
                        ? 'var(--color-ap-blue)'
                        : d.performance === 'fair'
                          ? 'var(--color-ap-gold)'
                          : isActive
                            ? 'var(--color-ap-mint)'
                            : 'var(--color-ap-muted)';

                  return (
                    <motion.div
                      key={d.session_id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() =>
                        navigate(`/debate/${d.session_id}`, {
                          state: {
                            topic: d.topic,
                            difficulty: d.difficulty,
                            isResume: true,
                          },
                        })
                      }
                      className="flex cursor-pointer items-center gap-3.5 rounded-ap border border-ap-line bg-ap-surface px-4 py-4 transition hover:-translate-y-px hover:border-ap-line-strong max-[700px]:gap-2.5 max-[700px]:px-3.5"
                    >
                      <div
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: perfColor }}
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-semibold tracking-[-0.015em] text-ap-ink">
                          {d.topic}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                          <span className="inline-flex h-6 items-center rounded-ap-sm border border-ap-line px-2.5 text-[11px] font-semibold capitalize text-ap-ink-soft">
                            {d.difficulty}
                          </span>
                          {isActive ? (
                            <span
                              className="text-[11px] font-semibold"
                              style={{ color: 'var(--color-ap-mint)' }}
                            >
                              ● Active
                            </span>
                          ) : (
                            d.performance && (
                              <span
                                className="text-[11px] font-semibold capitalize"
                                style={{ color: perfColor }}
                              >
                                {d.performance}
                              </span>
                            )
                          )}
                          <span className="text-[11px] text-ap-muted">
                            {new Date(d.started_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {d.avg_argument_strength != null && (
                        <div className="shrink-0 text-right max-[480px]:hidden">
                          <p className="text-2xl font-bold leading-none tracking-[-0.04em] tabular-nums text-ap-ink">
                            {d.avg_argument_strength.toFixed(1)}
                          </p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-ap-muted">
                            strength
                          </p>
                        </div>
                      )}
                      <ChevronRight size={17} className="shrink-0 text-ap-muted" />
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
