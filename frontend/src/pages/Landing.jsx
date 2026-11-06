import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { debateService } from '../services/debateService';
import PreviousDebatesSidebar from '../components/PreviousDebatesSidebar';
import NameSetupModal from '../components/NameSetupModal';
import ThemeToggle from '../components/ThemeToggle';
import {
  User,
  History,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  MessageSquare,
  Target,
  Zap,
  Brain,
  Search,
  BookOpen,
  HelpCircle,
  Flame,
  Check,
  ShieldCheck,
  Activity,
} from 'lucide-react';

const AGENTS = [
  {
    icon: Search,
    title: 'Argument Analyzer',
    text: 'Scores structure, claims and evidence, then flags the exact weakness in your case.',
    tag: 'Logic',
  },
  {
    icon: BookOpen,
    title: 'Evidence Researcher',
    text: 'Pulls credible sources on both sides so you never argue from an empty position.',
    tag: 'Research',
  },
  {
    icon: HelpCircle,
    title: 'Socratic Questioner',
    text: 'Asks the uncomfortable questions that expose assumptions you did not know you held.',
    tag: 'Depth',
  },
  {
    icon: Flame,
    title: "Devil's Advocate",
    text: 'Builds the strongest possible case against you — no straw men, no easy wins.',
    tag: 'Pressure',
  },
];

const STEPS = [
  { n: '01', title: 'Name your arena', text: 'Type any topic and pick the intensity. No setup, no sign-up.' },
  { n: '02', title: 'Make your case', text: 'Debate a panel of four AI agents in real time, round after round.' },
  { n: '03', title: 'Review the verdict', text: 'Get a breakdown of fallacies, evidence gaps and a plan to improve.' },
];

const PANEL_TILES = [
  { icon: Search, label: 'Analyzer' },
  { icon: BookOpen, label: 'Researcher' },
  { icon: HelpCircle, label: 'Socratic' },
  { icon: Flame, label: 'Advocate' },
];

const QUICK_STATS = [
  { value: '4', label: 'Agents' },
  { value: '10', label: 'Point scale' },
  { value: 'Live', label: 'Feedback' },
];

const ease = [0.22, 1, 0.36, 1];

function Landing() {
  const DUMMY_USER_ID = '8f3c2e7b-6b4a-4c9a-9e6f-2d5c1a8f7e42';
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();
  const arenaRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/user/${DUMMY_USER_ID}/profile`);
        const data = await res.json();
        if (!data.user.username) {
          setShowNameModal(true);
        } else {
          setUsername(data.user.username);
        }
      } catch {
        // backend not ready yet, skip
      }
    };
    checkUser();
  }, []);

  const handleStartDebate = async () => {
    if (!topic.trim()) return alert('Please enter a topic');
    setLoading(true);
    try {
      const response = await debateService.startDebate(topic, difficulty);
      navigate(`/debate/${response.session_id}`, { state: { topic, difficulty } });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDebate = (debate) => {
    navigate(`/debate/${debate.sessionId}`, {
      state: { topic: debate.topic, difficulty: debate.difficulty, isResume: true },
    });
  };

  const focusArena = () => {
    arenaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => inputRef.current?.focus(), 420);
  };

  const difficultyMeta = {
    casual: { label: 'Casual' },
    standard: { label: 'Standard' },
    expert: { label: 'Expert' },
  };

  return (
    <div className="min-h-screen relative overflow-x-clip text-ink">
      {/* ── Ambient clay blobs ───────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="clay-blob clay-float-slow absolute top-[8%] left-[3%] w-72 h-72" style={{ background: 'var(--blob-1)' }} />
        <div className="clay-blob clay-float absolute top-[42%] right-[2%] w-96 h-96" style={{ background: 'var(--blob-2)' }} />
        <div className="clay-blob clay-float-slow absolute top-[78%] left-[32%] w-80 h-80" style={{ background: 'var(--blob-3)' }} />
      </div>

      {/* ── Floating clay nav ─────────────────────────────────────── */}
      <div className="fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl">
        <nav className="clay-card-sm flex items-center justify-between gap-3 px-4 py-3 md:px-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 select-none shrink-0">
            <span className="clay-tile w-9 h-9 rounded-xl text-sm font-display text-ink">D</span>
            <span className="text-lg font-black tracking-tight">
              <span className="gradient-text">Debate</span>
              <span className="text-muted">AI</span>
            </span>
          </button>

          <ul className="hidden md:flex items-center gap-1 clay-inset rounded-full px-2 py-1.5">
            {[
              ['Arena', '#arena'],
              ['Agents', '#agents'],
              ['How it works', '#how'],
            ].map(([label, href]) => (
              <li key={href}>
                <a
                  href={href}
                  className="block px-4 py-1.5 rounded-full text-sm font-bold text-muted hover:text-ink hover:bg-white/5 transition-all duration-300"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => setIsSidebarOpen(true)}
              className="clay-icon-btn w-10 h-10"
              aria-label="Debate history"
              title="Debate history"
            >
              <History size={16} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => navigate('/profile')}
              className="clay-icon-btn w-10 h-10"
              aria-label="Profile"
              title="Profile"
            >
              <User size={16} />
            </motion.button>
            <button onClick={focusArena} className="hidden sm:inline-flex clay-btn px-5 py-2.5 text-sm font-bold">
              Start
              <ArrowRight size={15} />
            </button>
          </div>
        </nav>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section id="arena" className="relative z-10 min-h-screen flex items-center px-6 md:px-16 pt-32 pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 items-center gap-14 md:gap-12 w-full">
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="space-y-7 text-center md:text-left"
          >
            <div className="clay-pill inline-flex items-center gap-2 px-4 py-2 text-[11px] font-bold tracking-widest uppercase text-muted">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping" style={{ backgroundColor: 'var(--clay-mint)' }} />
                <span className="relative inline-flex w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--clay-mint)' }} />
              </span>
              Welcome back, {username || 'Debater'}
            </div>

            <h1 className="text-[clamp(3rem,6.8vw,6rem)] font-black tracking-tight leading-[0.92]">
              <span className="gradient-text">Sharpen</span>
              <span className="block text-ink">your arguments.</span>
            </h1>

            <p className="uppercase tracking-[0.28em] text-muted text-[11px] font-bold">
              AI debate training · No filler
            </p>

            <p className="text-muted text-base md:text-lg max-w-lg mx-auto md:mx-0 leading-relaxed">
              Debate a panel of AI specialists that challenge weak logic, bring evidence,
              and push every claim further than you thought it could go.
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-2.5">
              {[
                { icon: Brain, text: '4 expert agents' },
                { icon: Target, text: 'Fallacy detection' },
                { icon: Zap, text: 'Live feedback' },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="inline-flex items-center gap-2 text-xs font-bold text-ink-soft">
                  <span className="clay-tile w-6 h-6 rounded-lg">
                    <Check size={12} />
                  </span>
                  {text}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-1">
              <button onClick={focusArena} className="clay-btn px-8 py-3.5 text-sm font-bold">
                Begin a debate
                <ArrowRight size={16} />
              </button>
              <button onClick={() => setIsSidebarOpen(true)} className="clay-btn-soft px-8 py-3.5 text-sm font-bold">
                <History size={16} />
                View history
              </button>
            </div>
          </motion.div>

          {/* Arena card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.75, ease }}
            className="relative"
          >
            <div ref={arenaRef} className="clay-card-lg p-5 sm:p-6 md:p-7 max-w-md mx-auto relative scroll-mt-28">
              <div className="flex items-center gap-4">
                <div className="clay-tile w-14 h-14 shrink-0 text-ink">
                  <Sparkles size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-muted">Ready when you are</p>
                  <p className="text-xl font-black text-ink truncate">New debate</p>
                  <p className="text-xs text-muted truncate">Panel armed · 4 agents</p>
                </div>
                <span
                  className="ml-auto w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: 'var(--clay-mint)', boxShadow: '0 0 12px color-mix(in srgb, var(--clay-mint) 70%, transparent)' }}
                />
              </div>

              {/* Topic */}
              <div className="clay-inset mt-6 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={13} className="text-ink" />
                  <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted">
                    Debate topic
                  </label>
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStartDebate()}
                  placeholder="e.g. AI will replace most jobs by 2040"
                  className="clay-input-bare text-sm font-semibold"
                />
              </div>

              {/* Difficulty */}
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted mt-5 mb-2">
                Difficulty
              </p>
              <div className="clay-inset p-1.5 grid grid-cols-3 gap-1.5 rounded-full">
                {['casual', 'standard', 'expert'].map((level) => {
                  const active = difficulty === level;
                  return (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className="rounded-full py-2.5 text-xs font-bold capitalize transition-all duration-200"
                      style={{
                        background: active ? 'var(--clay-grad-primary)' : 'transparent',
                        color: active ? 'var(--clay-on-primary)' : 'var(--clay-muted)',
                        boxShadow: active ? 'var(--shadow-primary)' : 'none',
                      }}
                    >
                      {difficultyMeta[level].label}
                    </button>
                  );
                })}
              </div>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartDebate}
                disabled={loading}
                className="clay-btn mt-4 w-full py-3.5 text-sm font-bold"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Preparing arena…
                  </>
                ) : (
                  <>
                    Enter the arena
                    <ArrowRight size={17} />
                  </>
                )}
              </motion.button>

              {/* Panel */}
              <div className="flex items-center gap-3 mt-6 mb-3">
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--card-border)' }} />
                <p className="text-[10px] font-bold tracking-widest uppercase text-muted">Meet your panel</p>
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--card-border)' }} />
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                {PANEL_TILES.map(({ icon: Icon, label }) => (
                  <div key={label} className="clay-tile clay-hover flex flex-col items-center gap-2 py-3">
                    <Icon size={17} className="text-ink" />
                    <span className="text-[9px] font-bold uppercase tracking-wide text-muted">{label}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2.5 mt-4">
                {QUICK_STATS.map((s) => (
                  <div key={s.label} className="clay-inset px-2 py-3 text-center">
                    <p className="text-base font-black gradient-text">{s.value}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <div className="hidden sm:flex clay-card-sm absolute -bottom-5 -left-4 z-10 items-center gap-2.5 px-4 py-3 clay-float">
              <div className="clay-tile w-8 h-8 rounded-xl" style={{ backgroundColor: 'var(--clay-mint-soft)' }}>
                <ShieldCheck size={15} style={{ color: 'var(--clay-mint)' }} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Fallacy check</p>
                <p className="text-xs font-bold text-ink">1 weak link found</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Agents ────────────────────────────────────────────────── */}
      <section id="agents" className="relative z-10 px-6 md:px-16 py-24 overflow-hidden">
        <div className="absolute inset-0 dot-grid pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-16"
          >
            <p className="section-eyebrow mb-3">Meet the panel</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-ink mb-6">
              Four specialists. <span className="gradient-text">Every round.</span>
            </h2>
            <div className="gradient-rule mx-auto" />
            <p className="text-base md:text-lg text-muted max-w-2xl mx-auto leading-relaxed mt-6">
              Each agent attacks a different dimension of your argument, so the feedback you
              get is specific instead of generic.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {AGENTS.map(({ icon: Icon, title, text, tag }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.08, duration: 0.55, ease }}
                className="clay-card clay-hover p-6 flex flex-col group min-h-[240px]"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="clay-tile w-14 h-14 text-ink">
                    <Icon size={22} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted mt-1">
                    {tag}
                  </span>
                </div>
                <h3 className="text-lg font-black text-ink leading-tight">{title}</h3>
                <p className="text-sm text-muted mt-2 leading-relaxed flex-1">{text}</p>
                <div className="mt-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--clay-mint)' }} />
                  Active in every debate
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────── */}
      <section id="how" className="relative z-10 px-6 md:px-16 py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="clay-card-lg p-7 md:p-12 grid md:grid-cols-5 gap-10 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease }}
              className="md:col-span-2"
            >
              <p className="section-eyebrow mb-3">How it works</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-ink leading-[1.02]">
                From topic to <span className="gradient-text">verdict</span> in minutes.
              </h2>
              <p className="mt-5 text-sm md:text-base text-muted leading-relaxed max-w-sm">
                No accounts to manage, no complicated setup. Pick a position and start
                arguing — the panel handles the rest.
              </p>
              <button onClick={focusArena} className="clay-btn mt-7 px-7 py-3.5 text-sm font-bold">
                Start now
                <ArrowUpRight size={16} />
              </button>
            </motion.div>

            <div className="md:col-span-3 space-y-4">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ delay: i * 0.1, duration: 0.55, ease }}
                  className="clay-inset flex items-start gap-4 p-4 md:p-5"
                >
                  <span className="text-2xl md:text-3xl font-black gradient-text leading-none shrink-0 mt-0.5">
                    {s.n}
                  </span>
                  <div>
                    <p className="text-sm md:text-base font-black text-ink">{s.title}</p>
                    <p className="text-xs md:text-sm text-muted mt-1 leading-relaxed">{s.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-16 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease }}
          className="max-w-6xl mx-auto clay-card-lg relative overflow-hidden p-8 md:p-14 text-center"
        >
          <div className="clay-blob absolute -top-24 -right-16 w-72 h-72" style={{ background: 'var(--blob-1)' }} />
          <div className="clay-blob absolute -bottom-28 -left-16 w-72 h-72" style={{ background: 'var(--blob-3)' }} />

          <div className="relative">
            <div className="clay-tile w-14 h-14 mx-auto mb-6 text-ink">
              <Activity size={22} />
            </div>
            <p className="section-eyebrow mb-3">Your move</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-ink leading-[1.03]">
              Ready to make your <span className="gradient-text">case?</span>
            </h2>
            <p className="text-sm md:text-base text-muted max-w-xl mx-auto leading-relaxed mt-4">
              The panel is waiting. Pick a topic, choose your intensity, and find out where
              your argument actually holds up.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <button onClick={focusArena} className="clay-btn px-8 py-3.5 text-sm font-bold">
                Begin a debate
                <ArrowRight size={16} />
              </button>
              <button onClick={() => navigate('/profile')} className="clay-btn-soft px-8 py-3.5 text-sm font-bold">
                View profile
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="relative z-10 px-6 md:px-16 pb-8 pt-6">
        <div className="max-w-6xl mx-auto clay-card-lg p-8 md:p-12">
          <div className="grid md:grid-cols-3 gap-10 md:gap-12 mb-10">
            <div>
              <h3 className="text-2xl font-black tracking-tight mb-4">
                <span className="gradient-text">Debate</span>
                <span className="text-muted">AI</span>
              </h3>
              <p className="text-muted leading-relaxed mb-6 text-sm max-w-xs">
                Built for people who would rather be challenged than comforted.
              </p>
              <span className="clay-pill inline-flex items-center gap-2 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-muted">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--clay-mint)' }} />
                Panel online
              </span>
            </div>

            <div>
              <h4 className="text-lg font-black text-ink mb-6 tracking-wide">Quick links</h4>
              <nav className="space-y-4">
                {[
                  ['Arena', '#arena'],
                  ['Agents', '#agents'],
                  ['How it works', '#how'],
                ].map(([label, href]) => (
                  <a
                    key={href}
                    href={href}
                    className="group block text-muted hover:text-ink hover:translate-x-2 transition-all duration-300 font-semibold text-sm"
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>

            <div>
              <h4 className="text-lg font-black text-ink mb-6 tracking-wide">Your studio</h4>
              <div className="space-y-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="flex items-center gap-3 text-muted hover:text-ink hover:translate-x-1 transition-all duration-300 text-sm font-semibold"
                >
                  <span className="clay-tile w-8 h-8 rounded-xl"><History size={14} /></span>
                  Debate history
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-3 text-muted hover:text-ink hover:translate-x-1 transition-all duration-300 text-sm font-semibold"
                >
                  <span className="clay-tile w-8 h-8 rounded-xl"><User size={14} /></span>
                  Profile &amp; progress
                </button>
                <button
                  onClick={focusArena}
                  className="flex items-center gap-3 text-muted hover:text-ink hover:translate-x-1 transition-all duration-300 text-sm font-semibold"
                >
                  <span className="clay-tile w-8 h-8 rounded-xl"><Sparkles size={14} /></span>
                  New debate
                </button>
              </div>
            </div>
          </div>

          <div
            className="border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-3"
            style={{ borderColor: 'var(--card-border)' }}
          >
            <p className="text-muted/80 text-xs">
              © {new Date().getFullYear()} DebateAI. Sharpen your thinking.
            </p>
            <div className="flex items-center gap-5 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--clay-mint)' }} />
                All systems ready
              </span>
              <button onClick={() => setIsSidebarOpen(true)} className="hover:text-ink transition-colors">
                History
              </button>
            </div>
          </div>
        </div>
      </footer>

      <PreviousDebatesSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectDebate={handleSelectDebate}
      />

      <NameSetupModal
        isOpen={showNameModal}
        onComplete={(name) => {
          setUsername(name);
          setShowNameModal(false);
        }}
      />
    </div>
  );
}

export default Landing;
