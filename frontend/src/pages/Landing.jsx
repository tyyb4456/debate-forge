// debate-ui/src/pages/Landing.jsx

import { useState, useEffect, useRef } from 'react';
import { motion as framerMotion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, History, User } from 'lucide-react';
import { debateService } from '../services/debateService';
import PreviousDebatesSidebar from '../components/PreviousDebatesSidebar';
import NameSetupModal from '../components/NameSetupModal';
import ThemeToggle from '../components/ThemeToggle';

const AGENTS = [
  {
    tag: 'Logic',
    title: 'Argument Analyzer',
    text: 'Scores structure, claims and evidence, then names the exact weakness in your case.',
  },
  {
    tag: 'Research',
    title: 'Evidence Researcher',
    text: 'Brings credible sources to both sides so you never argue from an empty position.',
  },
  {
    tag: 'Depth',
    title: 'Socratic Questioner',
    text: 'Asks the uncomfortable questions that expose assumptions you did not know you held.',
  },
  {
    tag: 'Pressure',
    title: "Devil's Advocate",
    text: 'Builds the strongest possible case against you. No straw men, no easy wins.',
  },
];

const STEPS = [
  {
    title: 'Name the motion',
    text: 'Type any topic and choose the intensity. There is no setup and no sign-up.',
  },
  {
    title: 'Argue the rounds',
    text: 'Your panel pushes back in real time, one specialist at a time.',
  },
  {
    title: 'Read the verdict',
    text: 'Get logic, evidence and clarity scores, plus a plan for the next round.',
  },
];

const DIFFICULTIES = [
  { id: 'casual', label: 'Casual' },
  { id: 'standard', label: 'Standard' },
  { id: 'expert', label: 'Expert' },
];

const NAV_LINKS = [
  ['Arena', '#arena'],
  ['Specialists', '#specialists'],
  ['How it works', '#how'],
];

const Motion = framerMotion;
const ease = [0.22, 1, 0.36, 1];

const CONTAINER =
  'mx-auto w-full max-w-[1200px] px-[clamp(20px,4vw,56px)]';

const BTN =
  'clay-btn clay-btn-accent inline-flex h-[52px] items-center justify-center gap-2.5 px-[26px] text-ap-body font-semibold leading-none text-ap-accent-ink hover:bg-ap-accent/85 disabled:cursor-not-allowed disabled:opacity-55 max-[520px]:w-full';

const BTN_GHOST =
  'clay-btn clay-btn-ghost inline-flex h-[52px] items-center justify-center gap-2.5 px-6 text-ap-body font-medium leading-none text-ap-ink hover:bg-ap-ink/5 max-[520px]:w-full';

const ICON_BTN =
  'clay-icon inline-flex h-10 w-10 items-center justify-center text-ap-ink max-[520px]:h-[38px] max-[520px]:w-[38px]';

const SECTION_TITLE =
  'm-0 text-ap-head font-bold leading-[0.98] tracking-[-0.035em]';

const SECTION_COPY =
  'mt-6 max-w-[42ch] text-ap-lead leading-[1.55] text-ap-ink-soft max-[980px]:max-w-[52ch]';

function Landing() {
  const DUMMY_USER_ID = '8f3c2e7b-6b4a-4c9a-9e6f-2d5c1a8f7e42';
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();
  const arenaRef = useRef(null);
  const inputRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/user/${DUMMY_USER_ID}/profile`
        );
        const data = await res.json();
        if (!data.user.username) {
          setShowNameModal(true);
        } else {
          setUsername(data.user.username);
        }
      } catch {
        // Backend not ready yet; the page is still usable.
      }
    };
    checkUser();
  }, []);

  const handleStartDebate = async () => {
    if (!topic.trim()) {
      setError('Add a motion before entering the arena.');
      inputRef.current?.focus();
      return;
    }

    setError('');
    setLoading(true);
    try {
      const response = await debateService.startDebate(topic.trim(), difficulty);
      navigate(`/debate/${response.session_id}`, {
        state: { topic: topic.trim(), difficulty },
      });
    } catch {
      setError('Could not start the debate. Check that the server is running.');
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
    arenaRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'center',
    });
    window.setTimeout(() => inputRef.current?.focus(), reduceMotion ? 0 : 420);
  };

  const enter = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7, ease },
      };

  const reveal = (delay = 0, amount = 0.25) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount },
          transition: { delay, duration: 0.55, ease },
        };

  return (
    <div className="focus-ring min-h-svh overflow-x-clip scroll-smooth bg-ap-bg font-sans text-ap-ink antialiased selection:bg-ap-accent selection:text-ap-accent-ink motion-reduce:scroll-auto">
      <header className="sticky top-0 z-50 bg-ap-bg">
        <nav
          className={`${CONTAINER} flex h-[76px] items-center justify-between gap-6 max-[760px]:h-[68px]`}
          aria-label="Main navigation"
        >
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex cursor-pointer items-center gap-2.5 border-0 bg-transparent p-0 text-ap-lead font-bold tracking-[-0.025em] text-ap-ink"
          >
            <span
              className="clay-accent grid h-[30px] w-[30px] place-items-center text-sm font-bold leading-none text-ap-accent-ink"
              aria-hidden="true"
            >
              D
            </span>
            DebateAI
          </button>

          <ul className="flex items-center gap-1 max-[900px]:hidden">
            {NAV_LINKS.map(([label, href]) => (
              <li key={href}>
                <a
                  href={href}
                  className="block rounded-[2px] px-3.5 py-2.5 text-ap-body font-medium text-ap-muted no-underline transition-colors hover:text-ap-ink"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className={ICON_BTN}
              aria-label="Debate history"
              title="Debate history"
            >
              <History size={17} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className={ICON_BTN}
              aria-label="Your profile"
              title="Your profile"
            >
              <User size={17} />
            </button>
            <button
              type="button"
              onClick={focusArena}
              className="clay-btn clay-btn-accent inline-flex h-10 cursor-pointer items-center justify-center gap-2 px-[18px] text-ap-body font-semibold leading-none text-ap-accent-ink hover:bg-ap-accent/85 max-[760px]:hidden"
            >
              Start
              <ArrowRight size={15} />
            </button>
          </div>
        </nav>
      </header>

      <main>
        <section
          id="arena"
          className="scroll-mt-[90px] pb-[clamp(72px,10vh,120px)] pt-[clamp(56px,9vh,104px)]"
        >
          <div
            className={`${CONTAINER} grid items-center gap-[clamp(40px,6vw,88px)] min-[980px]:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)]`}
          >
            <Motion.div className="max-w-[660px]" {...enter}>
              <h1 className="m-0 text-ap-display font-bold leading-[0.9] tracking-[-0.04em] max-[520px]:text-[clamp(2.9rem,14vw,3.6rem)]">
                <span className="block">Sharpen</span>
                <span className="block">your case.</span>
              </h1>

              <p className="mt-7 max-w-[46ch] text-ap-lead leading-[1.55] text-ap-ink-soft">
                Face four AI specialists who find the weak claim, demand the
                evidence, and argue the other side harder than you expected.
              </p>

              <div className="mt-9 flex flex-wrap gap-3 max-[520px]:flex-col max-[520px]:items-stretch">
                <Motion.button
                  type="button"
                  onClick={focusArena}
                  className={BTN}
                  whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                >
                  Start a debate
                  <ArrowRight size={17} />
                </Motion.button>
                <a href="#how" className={BTN_GHOST}>
                  See how it works
                  <ArrowUpRight size={16} />
                </a>
              </div>

              <p className="mt-[30px] flex flex-wrap items-center gap-x-5 gap-y-2 text-sm leading-snug text-ap-muted">
                <span>No sign-up</span>
                <span className="inline-flex items-center gap-5">
                  <span
                    className="h-[3px] w-[3px] rounded-full bg-current opacity-60"
                    aria-hidden="true"
                  />
                  Four specialists
                </span>
                <span className="inline-flex items-center gap-5">
                  <span
                    className="h-[3px] w-[3px] rounded-full bg-current opacity-60"
                    aria-hidden="true"
                  />
                  Instant verdict
                </span>
              </p>
            </Motion.div>

            <Motion.div
              ref={arenaRef}
              {...(reduceMotion
                ? {}
                : {
                    initial: { opacity: 0, y: 24 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: 0.12, duration: 0.7, ease },
                  })}
            >
              <div
                className="clay-panel w-full max-w-[468px] overflow-hidden text-ap-panel-ink min-[980px]:ml-auto max-[980px]:max-w-[560px]"
                data-ui
              >
                <div className="flex h-2.5" aria-hidden="true">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span key={i} className="flex-1 bg-ap-accent even:bg-ap-panel-2" />
                  ))}
                </div>

                <div className="p-[clamp(24px,3vw,34px)] max-[520px]:p-[22px]">
                  <div className="mb-7 flex items-start justify-between gap-4 max-[520px]:mb-6">
                    <div>
                      <h2 className="m-0 text-ap-lead font-bold leading-[1.1] tracking-[-0.025em]">
                        New debate
                      </h2>
                      <span className="inline-flex items-center gap-[7px] whitespace-nowrap pt-1 text-sm text-ap-panel-muted">
                        <span
                          className="h-[7px] w-[7px] rounded-full bg-ap-accent"
                          aria-hidden="true"
                        />
                        {username
                          ? `Welcome back, ${username}`
                          : 'Four specialists ready'}
                      </span>
                    </div>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleStartDebate();
                    }}
                  >
                    <label
                      className="mb-2 block text-sm font-medium leading-tight text-ap-panel-muted"
                      htmlFor="lp-motion"
                    >
                      Motion
                    </label>
                    <input
                      ref={inputRef}
                      id="lp-motion"
                      type="text"
                      value={topic}
                      onChange={(e) => {
                        setTopic(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="e.g. AI will replace most jobs by 2040"
                      className="clay-inset-dark h-[52px] w-full px-4 text-ap-body font-medium text-ap-panel-ink outline-none transition-colors placeholder:font-normal placeholder:text-ap-panel-muted focus:border-ap-accent"
                      autoComplete="off"
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? 'lp-motion-error' : undefined}
                    />
                    {error ? (
                      <p
                        id="lp-motion-error"
                        className="mt-2.5 text-sm leading-snug text-ap-danger"
                        role="alert"
                      >
                        {error}
                      </p>
                    ) : (
                      <p className="mt-2.5 text-sm leading-snug text-ap-panel-muted">
                        A clear, arguable claim works best.
                      </p>
                    )}

                    <div className="mt-6">
                      <span
                        className="mb-2 block text-sm font-medium leading-tight text-ap-panel-muted"
                        id="lp-intensity-label"
                      >
                        Intensity
                      </span>
                      <div
                        className="clay-inset-dark grid grid-cols-3 gap-1 p-1.5"
                        role="group"
                        aria-labelledby="lp-intensity-label"
                      >
                        {DIFFICULTIES.map((level) => {
                          const active = difficulty === level.id;
                          return (
                            <button
                              key={level.id}
                              type="button"
                              onClick={() => setDifficulty(level.id)}
                              aria-pressed={active}
                              className={`h-10 cursor-pointer rounded-ap-sm text-sm transition-colors ${
                                active
                                  ? 'clay-btn-accent bg-ap-accent font-semibold text-ap-accent-ink'
                                  : 'font-medium text-ap-panel-muted hover:bg-white/5 hover:text-ap-panel-ink'
                              }`}
                            >
                              {level.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Motion.button
                      type="submit"
                      className={`${BTN} mt-6 w-full`}
                      disabled={loading}
                      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Preparing the arena…
                        </>
                      ) : (
                        <>
                          Enter the arena
                          <ArrowRight size={17} />
                        </>
                      )}
                    </Motion.button>
                  </form>

                  <p className="mt-4 text-sm leading-normal text-ap-panel-muted">
                    Your panel will challenge logic, evidence, assumptions and
                    pressure.
                  </p>
                </div>
              </div>
            </Motion.div>
          </div>
        </section>

        <section
          id="specialists"
          className="scroll-mt-[90px] py-[clamp(80px,12vh,140px)]"
        >
          <div
            className={`${CONTAINER} grid items-start gap-[clamp(40px,7vw,100px)] min-[980px]:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]`}
          >
            <Motion.div
              className="min-[980px]:sticky min-[980px]:top-28"
              {...reveal()}
            >
              <h2 className={SECTION_TITLE}>Four specialists.</h2>
              <p className={SECTION_COPY}>
                Each one attacks a different part of your case, so the feedback is
                specific instead of generic.
              </p>
            </Motion.div>

            <div className="flex flex-col">
              {AGENTS.map((agent, i) => (
                <Motion.article
                  key={agent.title}
                  className="clay clay-interactive mb-3 grid grid-cols-[108px_minmax(0,1fr)] gap-6 px-6 py-6 max-[760px]:grid-cols-1 max-[760px]:gap-2 max-[760px]:py-5"
                  {...reveal(i * 0.06, 0.3)}
                >
                  <span className="pt-1 text-sm leading-snug text-ap-muted max-[760px]:pt-0">
                    {agent.tag}
                  </span>
                  <div>
                    <h3 className="m-0 flex items-center gap-2.5 text-ap-lead font-semibold leading-tight tracking-[-0.015em] text-ap-ink">
                      <span className="h-2 w-2 flex-none bg-ap-accent" aria-hidden="true" />
                      {agent.title}
                    </h3>
                    <p className="mt-2 max-w-[56ch] text-ap-body leading-[1.55] text-ap-ink-soft">
                      {agent.text}
                    </p>
                  </div>
                </Motion.article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="inside"
          className="scroll-mt-[90px] py-[clamp(80px,12vh,140px)]"
        >
          <div className={CONTAINER}>
            <div className="mb-[clamp(36px,5vw,56px)] flex items-end justify-between gap-12 max-[980px]:grid max-[980px]:gap-6">
              <Motion.h2 className={SECTION_TITLE} {...reveal()}>
                Inside a round.
              </Motion.h2>
              <Motion.p
                className="m-0 max-w-[36ch] text-ap-lead leading-[1.55] text-ap-ink-soft max-[980px]:max-w-[52ch]"
                {...reveal(0.08)}
              >
                Every turn leaves a trace: the question, the weak claim, the score.
              </Motion.p>
            </div>

            <div className="grid gap-4 min-[980px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
              <Motion.div
                className="flex min-h-[260px] flex-col clay-panel p-[clamp(20px,2.4vw,28px)] text-ap-panel-ink"
                data-ui
                {...reveal(0, 0.2)}
              >
                <div className="mb-[22px] flex items-center justify-between gap-3 text-sm leading-snug text-ap-panel-muted">
                  <span className="font-semibold text-ap-panel-ink">
                    Socratic Questioner
                  </span>
                  <span>Round 2 of 5</span>
                </div>
                <p className="m-0 max-w-[34ch] text-ap-lead font-medium leading-[1.4] tracking-[-0.01em] text-ap-panel-ink">
                  “If a machine can imitate the argument, what is left that only a
                  human can defend?”
                </p>
                <div className="mt-auto flex items-center justify-between gap-4 pt-7 text-sm text-ap-panel-muted">
                  <span>Your turn</span>
                  <span className="clay-inset-dark max-w-[220px] flex-1 px-3.5 py-3 text-sm text-ap-panel-muted max-[760px]:max-w-none">
                    Type your response…
                  </span>
                </div>
              </Motion.div>

              <Motion.div
                className="flex min-h-[260px] flex-col clay-panel p-[clamp(20px,2.4vw,28px)] text-ap-panel-ink"
                data-ui
                {...reveal(0.08, 0.2)}
              >
                <div className="mb-[22px] flex items-center justify-between gap-3 text-sm leading-snug text-ap-panel-muted">
                  <span className="font-semibold text-ap-panel-ink">
                    Argument Analyzer
                  </span>
                  <span>Finding</span>
                </div>
                <p className="m-0 text-ap-body leading-[1.55] text-ap-panel-ink">
                  You claimed{' '}
                  <mark className="bg-ap-accent px-[3px] text-ap-accent-ink">
                    automation destroys jobs
                  </mark>
                  , but your evidence covers only manufacturing.
                </p>
                <div className="mt-auto flex flex-wrap items-center gap-3 pt-6 text-sm text-ap-panel-muted">
                  <span className="clay-accent bg-ap-accent px-2.5 py-1.5 font-semibold text-ap-accent-ink">
                    Unsupported scope
                  </span>
                  <span>Evidence 5 / 10</span>
                </div>
              </Motion.div>

              <Motion.div
                className="col-span-full grid min-h-[210px] items-center gap-[clamp(24px,4vw,48px)] clay-panel p-[clamp(20px,2.4vw,28px)] text-ap-panel-ink min-[980px]:grid-cols-[auto_minmax(0,1fr)_220px] max-[980px]:grid-cols-[auto_minmax(0,1fr)] max-[760px]:grid-cols-1 max-[760px]:gap-6"
                data-ui
                {...reveal(0.12, 0.2)}
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-ap-head font-bold leading-none tracking-[-0.04em] text-ap-panel-ink">
                    6.7
                  </span>
                  <span className="text-sm text-ap-panel-muted">out of 10</span>
                </div>
                <div className="grid gap-3.5">
                  {[
                    ['Logic', 7],
                    ['Evidence', 5],
                    ['Clarity', 8],
                  ].map(([label, value]) => (
                    <div
                      className="grid grid-cols-[76px_minmax(0,1fr)_24px] items-center gap-3 text-sm text-ap-panel-muted"
                      key={label}
                    >
                      <span>{label}</span>
                      <span className="clay-track-dark block h-2">
                        <span
                          className="block h-full rounded-full bg-ap-accent"
                          style={{ width: `${value * 10}%` }}
                        />
                      </span>
                      <strong className="text-right font-semibold text-ap-panel-ink">
                        {value}
                      </strong>
                    </div>
                  ))}
                </div>
                <p className="m-0 max-w-[30ch] text-ap-body leading-normal text-ap-panel-muted max-[760px]:max-w-none">
                  Weakest link: evidence for the 2040 claim.
                </p>
              </Motion.div>
            </div>
          </div>
        </section>

        <section id="how" className="scroll-mt-[90px] bg-ap-accent text-ap-accent-ink">
          <div className="flex h-3.5" aria-hidden="true">
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} className="flex-1 bg-ap-accent-ink even:bg-ap-accent" />
            ))}
          </div>

          <div className={`${CONTAINER} py-[clamp(72px,10vh,120px)]`}>
            <div className="mb-[clamp(44px,6vw,72px)] flex items-end justify-between gap-12 max-[980px]:grid max-[980px]:gap-6">
              <Motion.h2
                className="m-0 max-w-[15ch] text-ap-head font-bold leading-[0.96] tracking-[-0.04em] text-ap-accent-ink"
                {...reveal()}
              >
                From motion to verdict.
              </Motion.h2>
              <Motion.p
                className="m-0 mb-1.5 max-w-[38ch] text-ap-lead leading-[1.55] text-ap-accent-ink/70"
                {...reveal(0.08)}
              >
                No setup, no account, no ceremony. Name the motion, argue the
                rounds, and read exactly what broke.
              </Motion.p>
            </div>

            <div className="grid gap-[clamp(32px,4.5vw,64px)] min-[760px]:grid-cols-3 max-[760px]:grid-cols-1 max-[760px]:gap-9">
              {STEPS.map((step, i) => (
                <Motion.div
                  key={step.title}
                  className="clay clay-interactive bg-white p-6 max-[760px]:p-5"
                  {...reveal(i * 0.08, 0.35)}
                >
                  <div className="mb-5 h-2.5 w-2.5 bg-ap-accent-ink max-[760px]:mb-3.5" aria-hidden="true" />
                  <h3 className="mb-2.5 mt-0 text-ap-lead font-semibold leading-tight tracking-[-0.015em] text-ap-accent-ink">
                    {step.title}
                  </h3>
                  <p className="m-0 text-ap-body leading-[1.55] text-ap-accent-ink/70">
                    {step.text}
                  </p>
                </Motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-[clamp(80px,12vh,140px)]">
          <div
            className={`${CONTAINER} grid items-end gap-[clamp(40px,7vw,100px)] min-[980px]:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] max-[980px]:gap-8`}
          >
            <Motion.h2
              className="m-0 max-w-[13ch] text-ap-display font-bold leading-[0.94] tracking-[-0.045em] text-ap-ink"
              {...reveal()}
            >
              Ready to argue?
            </Motion.h2>
            <Motion.div {...reveal(0.08)}>
              <p className="mb-7 mt-0 max-w-[40ch] text-ap-lead leading-[1.55] text-ap-ink-soft">
                Pick a motion, choose your intensity, and find out where your
                argument actually holds up.
              </p>
              <div className="flex flex-wrap gap-3 max-[520px]:flex-col max-[520px]:items-stretch">
                <button type="button" onClick={focusArena} className={BTN}>
                  Enter the arena
                  <ArrowRight size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  className={BTN_GHOST}
                >
                  Review past debates
                </button>
              </div>
            </Motion.div>
          </div>
        </section>
      </main>

      <footer className="overflow-hidden bg-ap-panel text-ap-panel-ink">
        <div className={`${CONTAINER} pb-7 pt-[clamp(48px,7vw,80px)]`}>
          <div className="flex items-start justify-between gap-12 pb-[clamp(48px,7vw,72px)] max-[760px]:flex-col max-[760px]:gap-7">
            <div className="flex flex-wrap gap-x-7 gap-y-2.5">
              {NAV_LINKS.map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  className="p-0 text-ap-body font-medium text-ap-panel-muted no-underline transition-colors hover:text-ap-panel-ink"
                >
                  {label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="cursor-pointer border-0 bg-transparent p-0 text-ap-body font-medium text-ap-panel-muted transition-colors hover:text-ap-panel-ink"
              >
                History
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="cursor-pointer border-0 bg-transparent p-0 text-ap-body font-medium text-ap-panel-muted transition-colors hover:text-ap-panel-ink"
              >
                Profile
              </button>
            </div>
            <p className="m-0 max-w-[32ch] text-ap-body leading-[1.55] text-ap-panel-muted">
              An AI sparring partner for anyone who has to make an argument count.
            </p>
          </div>

          <Motion.p
            className="m-0 flex items-end gap-[0.08em] whitespace-nowrap text-[clamp(3.5rem,12.5vw,11.5rem)] font-bold leading-[0.76] tracking-[-0.06em] text-ap-panel-ink"
            aria-label="DebateAI"
            {...reveal()}
          >
            DebateAI
            <span
              className="mb-[0.06em] h-[0.12em] w-[0.12em] flex-none bg-ap-accent"
              aria-hidden="true"
            />
          </Motion.p>

          <div className="mt-[clamp(32px,4vw,52px)] flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm leading-normal text-ap-panel-muted">
            <span>© {new Date().getFullYear()} DebateAI</span>
            <span>Built for sharper arguments.</span>
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
