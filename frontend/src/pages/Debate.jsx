// debate-ui/src/pages/Debate.jsx

import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { debateService, DebateStream } from '../services/debateService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Search,
  BookOpen,
  HelpCircle,
  Flame,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus,
  History,
  Zap,
  ArrowUp,
} from 'lucide-react';
import PreviousDebatesSidebar from '../components/PreviousDebatesSidebar';
import ThemeToggle from '../components/ThemeToggle';

const BTN =
  'inline-flex items-center justify-center gap-2 rounded-ap border border-transparent bg-ap-accent px-5 font-semibold leading-none text-ap-accent-ink transition hover:-translate-y-px hover:bg-ap-accent/85 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50';

const BTN_GHOST =
  'inline-flex items-center justify-center gap-2 rounded-ap border border-ap-line px-4 font-medium leading-none text-ap-ink transition hover:-translate-y-px hover:border-ap-line-strong hover:bg-ap-ink/5 disabled:cursor-not-allowed disabled:opacity-50';

const CHIP =
  'inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-ap-sm border border-ap-line px-2.5 text-[11px] font-semibold text-ap-ink-soft';

const KICKER =
  'text-[11px] font-semibold uppercase leading-tight tracking-[0.18em] text-ap-muted';

const DIFFICULTY_COLORS = {
  casual: 'var(--color-ap-mint)',
  standard: 'var(--color-ap-gold)',
  expert: 'var(--color-ap-peach)',
};

const STARTERS = [
  'Here is my opening case on this motion.',
  'Start with the strongest argument against me.',
  'Where is my argument weakest right now?',
];

// ============================================================================
// MARKDOWN RENDERER
// ============================================================================
function MarkdownMessage({ content }) {
  if (!content) return null;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="mb-[0.65em] text-[15px] leading-[1.75] text-ap-ink-soft last:mb-0">
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-ap-ink">{children}</strong>
        ),
        em: ({ children }) => <em className="italic text-ap-ink-soft">{children}</em>,
        ul: ({ children }) => <ul className="my-1.5 list-disc pl-5">{children}</ul>,
        ol: ({ children }) => <ol className="my-1.5 list-decimal pl-5">{children}</ol>,
        li: ({ children }) => (
          <li className="mb-1 text-[15px] leading-relaxed text-ap-ink-soft">
            {children}
          </li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-2.5 border-l-2 border-ap-accent pl-3.5 italic text-ap-muted">
            {children}
          </blockquote>
        ),
        a: ({ children, href }) => (
          <a
            className="text-ap-ink underline underline-offset-2"
            href={href}
            target="_blank"
            rel="noreferrer"
          >
            {children}
          </a>
        ),
        h1: ({ children }) => (
          <h3 className="mt-5 mb-2 text-xl font-bold tracking-[-0.02em] text-ap-ink">
            {children}
          </h3>
        ),
        h2: ({ children }) => (
          <h4 className="mt-4 mb-2 text-lg font-bold tracking-[-0.02em] text-ap-ink">
            {children}
          </h4>
        ),
        h3: ({ children }) => (
          <h5 className="mt-4 mb-1.5 text-base font-semibold text-ap-ink">
            {children}
          </h5>
        ),
        pre: ({ children }) => (
          <pre className="my-2.5 overflow-x-auto rounded-ap-sm border border-ap-line bg-ap-surface-2 p-3.5">
            {children}
          </pre>
        ),
        code: ({ className, children }) => (
          <code
            className={
              /language-/.test(className || '')
                ? 'font-mono text-[0.82em] leading-relaxed text-ap-ink-soft'
                : 'rounded-ap-sm border border-ap-line bg-ap-surface-2 px-1.5 py-0.5 font-mono text-[0.82em] text-ap-ink'
            }
          >
            {children}
          </code>
        ),
        hr: () => <hr className="my-4 border-ap-line" />,
        table: ({ children }) => (
          <div className="my-2.5 overflow-x-auto">
            <table className="w-full border-collapse text-sm">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-ap-line bg-ap-surface-2 px-2.5 py-2 text-left font-semibold text-ap-ink">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-ap-line px-2.5 py-2 align-top text-ap-ink-soft">
            {children}
          </td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ============================================================================
// AGENT INSIGHTS
// ============================================================================
const AGENT_CONFIG = {
  analyzer: { label: 'Analyzer', icon: Search, color: 'var(--color-ap-ink)' },
  researcher: { label: 'Researcher', icon: BookOpen, color: 'var(--color-ap-blue)' },
  socratic_questioner: {
    label: 'Socratic',
    icon: HelpCircle,
    color: 'var(--color-ap-gold)',
  },
  devils_advocate: {
    label: "Devil's Advocate",
    icon: Flame,
    color: 'var(--color-ap-peach)',
  },
};

function MessageInsights({ insights }) {
  const [openAgent, setOpenAgent] = useState(null);
  const active = Object.entries(insights).filter(([, v]) => v !== null);
  if (active.length === 0) return null;

  return (
    <div className="mt-2.5">
      <div className="flex flex-wrap gap-1.5">
        {active.map(([agent]) => {
          const cfg = AGENT_CONFIG[agent];
          if (!cfg) return null;
          const Icon = cfg.icon;
          const isOpen = openAgent === agent;
          return (
            <motion.button
              key={agent}
              type="button"
              onClick={() => setOpenAgent(isOpen ? null : agent)}
              whileTap={{ scale: 0.98 }}
              className={`inline-flex h-7 items-center gap-1.5 rounded-ap-sm border px-2.5 text-[11px] font-semibold transition-colors ${
                isOpen
                  ? 'border-transparent bg-ap-panel text-ap-panel-ink'
                  : 'border-ap-line bg-transparent text-ap-ink-soft hover:border-ap-line-strong'
              }`}
            >
              <Icon size={11} style={{ color: isOpen ? 'currentColor' : cfg.color }} />
              {cfg.label}
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="inline-flex"
              >
                <ChevronDown size={11} />
              </motion.span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {openAgent && insights[openAgent] && (
          <motion.div
            key={openAgent}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="overflow-hidden"
          >
            <div
              className="mt-2 rounded-ap-sm border border-ap-line border-l-2 bg-ap-surface p-4"
              style={{ borderLeftColor: AGENT_CONFIG[openAgent]?.color }}
            >
              {openAgent === 'analyzer' && <AnalyzerDetail output={insights.analyzer} />}
              {openAgent === 'researcher' && (
                <ResearcherDetail output={insights.researcher} />
              )}
              {openAgent === 'socratic_questioner' && (
                <SocraticDetail output={insights.socratic_questioner} />
              )}
              {openAgent === 'devils_advocate' && (
                <AdvocateDetail output={insights.devils_advocate} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AnalyzerDetail({ output }) {
  let data;
  try {
    data = typeof output === 'string' ? JSON.parse(output) : output;
  } catch {
    return null;
  }
  const score = data.argument_strength?.overall_score;
  const tone =
    score >= 7
      ? 'var(--color-ap-mint)'
      : score >= 5
        ? 'var(--color-ap-gold)'
        : 'var(--color-ap-peach)';

  return (
    <div>
      {data.argument_strength && (
        <div>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <p className="text-sm font-semibold text-ap-ink">Argument quality</p>
            <span className="text-sm font-bold tabular-nums text-ap-ink">
              {score}/10
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-ap-line">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(Math.max((score / 10) * 100, 0), 100)}%`,
              }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: tone }}
            />
          </div>
          {data.argument_strength.breakdown && (
            <p className="mt-2 text-sm leading-relaxed text-ap-muted">
              {data.argument_strength.breakdown}
            </p>
          )}
        </div>
      )}

      {data.fallacies_detected?.length > 0 && (
        <div className="mt-4">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ap-muted">
            Logical issues
          </p>
          {data.fallacies_detected.map((f, i) => (
            <div
              key={i}
              className="mb-1.5 rounded-ap-sm border border-ap-line bg-ap-surface-2 px-3 py-2.5 last:mb-0"
            >
              <p className="text-sm font-semibold capitalize text-ap-ink">
                {f.type?.replace(/_/g, ' ')}
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-ap-ink-soft">
                {f.explanation}
              </p>
            </div>
          ))}
        </div>
      )}

      {data.implicit_assumptions?.length > 0 && (
        <div className="mt-4">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ap-muted">
            Assumptions
          </p>
          {data.implicit_assumptions.slice(0, 2).map((a, i) => (
            <p key={i} className="mb-1 text-sm leading-relaxed text-ap-ink-soft">
              · {a.assumption || a}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function ResearcherDetail({ output }) {
  let data;
  try {
    data = typeof output === 'string' ? JSON.parse(output) : output;
  } catch {
    return null;
  }
  const supporting = data.supporting_evidence || [];
  const opposing = data.opposing_evidence || [];
  const sc = data.overall_evidence_strength
    ? {
        strong_support: {
          label: 'Strong support',
          color: 'var(--color-ap-mint)',
          Icon: TrendingUp,
        },
        mixed: { label: 'Mixed evidence', color: 'var(--color-ap-gold)', Icon: Minus },
        strong_opposition: {
          label: 'Mostly against',
          color: 'var(--color-ap-peach)',
          Icon: TrendingDown,
        },
      }[data.overall_evidence_strength]
    : null;

  return (
    <div>
      {sc && (
        <div className="mb-3 flex items-center gap-2">
          <sc.Icon size={13} style={{ color: sc.color }} />
          <p className="text-sm font-semibold" style={{ color: sc.color }}>
            {sc.label} · {data.total_sources_found || 0} sources
          </p>
        </div>
      )}

      {data.strongest_source && (
        <div className="mt-3 first:mt-0">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ap-muted">
            Most credible
          </p>
          <p className="text-sm leading-relaxed text-ap-ink-soft">
            {data.strongest_source.title || data.strongest_source.source_name}
          </p>
        </div>
      )}

      {supporting.length > 0 && (
        <div className="mt-4">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ap-muted">
            Supporting ({supporting.length})
          </p>
          {supporting.slice(0, 2).map((ev, i) => (
            <div
              key={i}
              className="mb-1.5 rounded-ap-sm border border-ap-line bg-ap-mint-soft px-3 py-2.5 last:mb-0"
            >
              <p className="text-sm font-semibold text-ap-ink">{ev.source_name}</p>
              {ev.key_finding && (
                <p className="mt-0.5 text-sm leading-relaxed text-ap-ink-soft">
                  {ev.key_finding}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {opposing.length > 0 && (
        <div className="mt-4">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ap-muted">
            Opposing ({opposing.length})
          </p>
          {opposing.slice(0, 2).map((ev, i) => (
            <div
              key={i}
              className="mb-1.5 rounded-ap-sm border border-ap-line bg-ap-peach-soft px-3 py-2.5 last:mb-0"
            >
              <p className="text-sm font-semibold text-ap-ink">{ev.source_name}</p>
              {ev.key_finding && (
                <p className="mt-0.5 text-sm leading-relaxed text-ap-ink-soft">
                  {ev.key_finding}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SocraticDetail({ output }) {
  let data;
  try {
    data = typeof output === 'string' ? JSON.parse(output) : output;
  } catch {
    return null;
  }
  return (
    <div>
      {data.questions?.map((q, i) => (
        <div
          key={i}
          className="mb-1.5 rounded-ap-sm border border-ap-line bg-ap-surface-2 px-3 py-2.5 last:mb-0"
        >
          <p className="text-sm font-semibold text-ap-ink">{q.question_text || q}</p>
          {q.question_type && (
            <p className="mt-0.5 text-sm capitalize text-ap-muted">
              {q.question_type.replace(/_/g, ' ')}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function AdvocateDetail({ output }) {
  let data;
  try {
    data = typeof output === 'string' ? JSON.parse(output) : output;
  } catch {
    return null;
  }
  return (
    <div>
      {data.opposing_position && (
        <div className="mb-1.5 rounded-ap-sm border border-ap-line bg-ap-peach-soft px-3 py-2.5">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-ap-muted">
            Counter-position
          </p>
          <p className="text-sm leading-relaxed text-ap-ink-soft">
            {data.opposing_position.statement || data.opposing_position}
          </p>
        </div>
      )}
      {data.counter_arguments?.slice(0, 2).map((arg, i) => (
        <div
          key={i}
          className="mb-1.5 rounded-ap-sm border border-ap-line bg-ap-peach-soft px-3 py-2.5 last:mb-0"
        >
          <p className="text-sm font-semibold capitalize text-ap-ink">
            {arg.type?.replace(/_/g, ' ')}
          </p>
          <p className="mt-0.5 text-sm leading-relaxed text-ap-ink-soft">
            {arg.argument}
          </p>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
function Debate() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [currentStream, setCurrentStream] = useState(null);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const pendingInsightsRef = useRef({
    analyzer: null,
    researcher: null,
    socratic_questioner: null,
    devils_advocate: null,
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const topic = location.state?.topic || 'Debate Topic';
  const difficulty = location.state?.difficulty || 'standard';
  const turnCount = Math.floor(messages.length / 2);
  const difficultyColor = DIFFICULTY_COLORS[difficulty] || DIFFICULTY_COLORS.standard;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const loadPreviousMessages = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/user/debate/${sessionId}/turns`
        );
        const data = await res.json();
        setMessages(
          data.turns.flatMap((t) => [
            { role: 'user', content: t.user_input },
            {
              role: 'assistant',
              content: t.ai_response,
              insights: {
                analyzer: t.analyzer_output || null,
                researcher: t.research_output || null,
                socratic_questioner: t.socratic_output || null,
                devils_advocate: t.advocate_output || null,
              },
            },
          ])
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadPreviousMessages();
  }, [sessionId]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    setMessages((p) => [...p, { role: 'user', content: input }]);
    const userInput = input;
    setInput('');
    setIsLoading(true);
    pendingInsightsRef.current = {
      analyzer: null,
      researcher: null,
      socratic_questioner: null,
      devils_advocate: null,
    };
    const idx = messages.length + 1;
    setMessages((p) => [...p, { role: 'assistant', content: '', insights: null }]);
    try {
      const stream = new DebateStream(sessionId, userInput, {
        onToken: (token) =>
          setMessages((p) => {
            const n = [...p];
            if (n[idx]) n[idx] = { ...n[idx], content: n[idx].content + token };
            return n;
          }),
        onAgentOutput: (agent, output) => {
          pendingInsightsRef.current = { ...pendingInsightsRef.current, [agent]: output };
          setCurrentAgent(agent);
          setStatusMessage(`${agent.replace(/_/g, ' ')} working…`);
          setTimeout(() => setCurrentAgent((c) => (c === agent ? null : c)), 500);
        },
        onComplete: (data) => {
          setIsLoading(false);
          setCurrentAgent(null);
          setStatusMessage('');
          const fi = { ...pendingInsightsRef.current };
          setMessages((p) => {
            const n = [...p];
            if (n[idx]) n[idx] = { ...n[idx], insights: fi };
            return n;
          });
          if (data.debate_ended && data.growth_feedback) setFeedback(data.growth_feedback);
        },
        onError: (err) => {
          console.error(err);
          setIsLoading(false);
          setCurrentAgent(null);
          setStatusMessage('');
          handleFallback(userInput, idx);
        },
      });
      setCurrentStream(stream);
    } catch {
      setIsLoading(false);
    }
  };

  const handleFallback = async (userInput, idx) => {
    try {
      const res = await debateService.sendMessage(sessionId, userInput);
      setMessages((p) => {
        const n = [...p];
        n[idx] = { role: 'assistant', content: res.ai_response, insights: null };
        return n;
      });
      if (res.debate_ended && res.growth_feedback) setFeedback(res.growth_feedback);
    } catch {
      alert('Failed to send message');
    }
  };

  const handleEndDebate = async () => {
    if (!confirm('End this debate?')) return;
    try {
      await debateService.endDebate(sessionId);
      navigate('/');
    } catch {
      alert('Failed to end debate');
    }
  };

  const handleSelectDebate = (debate) => {
    navigate(`/debate/${debate.sessionId}`, {
      state: { topic: debate.topic, difficulty: debate.difficulty, isResume: true },
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    return () => {
      if (currentStream) currentStream.close();
    };
  }, [currentStream]);

  const applyStarter = (text) => {
    setInput(text);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-ap-bg font-sans text-ap-ink selection:bg-ap-accent selection:text-ap-accent-ink">
      <header className="shrink-0 border-b border-ap-line bg-ap-bg">
        <div className="mx-auto flex min-h-[76px] w-full max-w-[1120px] flex-wrap items-center justify-between gap-5 px-5 py-3 sm:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-4 max-[700px]:flex-wrap">
            <button
              type="button"
              className="inline-flex items-center gap-2.5 text-lg font-bold tracking-[-0.025em] text-ap-ink"
              onClick={() => navigate('/')}
              aria-label="Back to DebateAI home"
            >
              <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-ap-sm bg-ap-accent text-[13px] font-bold text-ap-accent-ink">
                D
              </span>
              <span className="max-[700px]:hidden">DebateAI</span>
            </button>

            <span className="h-[30px] w-px bg-ap-line max-[700px]:hidden" aria-hidden="true" />

            <div className="min-w-0">
              <span className={`mb-1 block ${KICKER}`}>Motion</span>
              <h1
                className="m-0 max-w-[40ch] truncate text-lg font-semibold leading-tight tracking-[-0.02em] text-ap-ink max-[700px]:max-w-full"
                title={topic}
              >
                {topic}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className={CHIP}>
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: difficultyColor }}
                  />
                  <span className="capitalize">{difficulty}</span>
                </span>
                <span className={`${CHIP} text-ap-muted`}>Turn {turnCount}</span>
                <AnimatePresence>
                  {currentAgent && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      className="inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-ap-sm border border-ap-mint/35 bg-ap-mint/10 px-2.5 text-[11px] font-semibold text-ap-mint"
                    >
                      <motion.span
                        className="h-1.5 w-1.5 rounded-full bg-current"
                        animate={{ opacity: [0.35, 1, 0.35] }}
                        transition={{ repeat: Infinity, duration: 1.1 }}
                      />
                      {currentAgent.replace(/_/g, ' ')}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 max-[700px]:ml-0.5">
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-ap-sm border border-ap-line bg-transparent text-ap-ink transition-colors hover:border-ap-line-strong hover:bg-ap-ink/5"
              onClick={() => setIsHistoryOpen(true)}
              aria-label="Debate history"
              title="Debate history"
            >
              <History size={17} />
            </button>
            <button
              type="button"
              className={`${BTN_GHOST} h-[38px] px-3 text-sm text-ap-ink-soft hover:border-ap-danger/45 hover:bg-ap-danger/5 hover:text-ap-danger`}
              onClick={handleEndDebate}
            >
              <span className="hidden sm:inline">End debate</span>
              <span className="sm:hidden">End</span>
            </button>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[860px] px-5 pb-7 pt-7 sm:px-8 sm:pt-10">
          {loadingHistory ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-ap-muted">
              <span className="h-[34px] w-[34px] animate-spin rounded-full border-2 border-ap-line border-t-ap-ink" />
              <span>Loading the transcript…</span>
            </div>
          ) : messages.length === 0 && !isLoading ? (
            <div className="flex min-h-[55vh] items-center justify-center py-10">
              <div className="w-full max-w-[540px]">
                <span className={KICKER}>The floor is yours</span>
                <h2 className="mt-3.5 text-4xl font-bold leading-none tracking-[-0.035em] sm:text-5xl">
                  Make your <em className="not-italic text-ap-muted">opening case.</em>
                </h2>
                <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-ap-ink-soft">
                  State a clear, arguable claim on “{topic}”. Your panel will take it
                  apart one specialist at a time.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {STARTERS.map((starter, i) => (
                    <button
                      key={starter}
                      type="button"
                      className="inline-flex w-full items-center gap-2 rounded-ap-sm border border-ap-line px-3.5 py-2.5 text-left text-sm leading-snug text-ap-ink-soft transition-colors hover:border-ap-line-strong hover:bg-ap-ink/5 hover:text-ap-ink sm:w-auto"
                      onClick={() => applyStarter(starter)}
                    >
                      <span className="tabular-nums text-ap-muted">0{i + 1}</span>
                      <span>{starter}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.28 }}
                  className={`mb-7 flex items-start gap-3 ${
                    msg.role === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-ap-sm border border-transparent bg-ap-panel text-[10px] font-bold tracking-[0.08em] text-ap-panel-ink">
                      AI
                    </div>
                  )}

                  <div
                    className={
                      msg.role === 'user'
                        ? 'min-w-0 max-w-[82%] flex-none max-[700px]:max-w-[88%]'
                        : 'min-w-0 flex-1'
                    }
                  >
                    {msg.role === 'assistant' ? (
                      <div className="rounded-ap border border-ap-line bg-ap-surface px-5 py-4">
                        {msg.content ? (
                          <MarkdownMessage content={msg.content} />
                        ) : (
                          <span className="text-[15px] text-ap-muted">…</span>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-ap bg-ap-panel px-4 py-3 text-ap-panel-ink">
                        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                          {msg.content}
                        </p>
                      </div>
                    )}
                    {msg.role === 'assistant' && msg.insights && (
                      <MessageInsights insights={msg.insights} />
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-ap-sm border border-ap-line bg-transparent text-[10px] font-bold tracking-[0.08em] text-ap-muted">
                      U
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {isLoading && messages[messages.length - 1]?.content === '' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-3"
            >
              <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-ap-sm border border-transparent bg-ap-panel text-[10px] font-bold tracking-[0.08em] text-ap-panel-ink">
                AI
              </div>
              <div className="flex items-center gap-2.5 rounded-ap border border-ap-line bg-ap-surface px-4 py-3.5">
                <span className="flex gap-1">
                  {[0, 0.18, 0.36].map((d, i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-ap-accent"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 0.9, delay: d }}
                    />
                  ))}
                </span>
                <span className="text-sm capitalize text-ap-muted">
                  {statusMessage || 'Assembling the panel'}
                </span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      <div className="shrink-0 bg-ap-bg px-5 pb-[18px] pt-3 sm:px-8">
        <div className="mx-auto max-w-[860px]">
          <div className="flex items-end gap-2.5 rounded-ap border border-ap-line bg-ap-surface p-2.5 transition-colors focus-within:border-ap-line-strong">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your argument…"
              disabled={isLoading}
              rows={1}
              className="max-h-[180px] min-h-[44px] flex-1 resize-none border-0 bg-transparent px-2.5 py-[11px] text-[15px] leading-relaxed text-ap-ink outline-none placeholder:text-ap-muted disabled:opacity-50"
            />
            <motion.button
              type="button"
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              whileHover={!isLoading && input.trim() ? { y: -1 } : {}}
              whileTap={!isLoading && input.trim() ? { scale: 0.98 } : {}}
              className={`${BTN} h-11 shrink-0 px-[18px]`}
            >
              {isLoading ? (
                <svg
                  className="animate-spin"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    opacity="0.25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    opacity="0.75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <>
                  Send
                  <ArrowUp size={16} />
                </>
              )}
            </motion.button>
          </div>
          <p className="mt-2 text-center text-[11px] text-ap-muted">
            Enter to send · Shift + Enter for a new line
          </p>
        </div>
      </div>

      <PreviousDebatesSidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectDebate={handleSelectDebate}
      />

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm"
            onClick={() => {
              setFeedback(null);
              navigate('/');
            }}
          >
            <motion.div
              initial={{ scale: 0.97, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 12 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[86vh] w-full max-w-[620px] overflow-y-auto rounded-ap border border-ap-line bg-ap-bg p-6 sm:p-9"
            >
              <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-ap-sm bg-ap-accent text-ap-accent-ink">
                <Zap size={18} />
              </div>

              <span className={KICKER}>Session review</span>
              <h2 className="mt-2.5 text-3xl font-bold leading-none tracking-[-0.035em] sm:text-4xl">
                Debate complete
              </h2>

              {feedback.session_summary && (
                <div className="mt-6 rounded-ap-sm bg-ap-panel px-4 py-4 text-ap-panel-ink">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ap-panel-muted">
                    Overall performance
                  </p>
                  <p className="mt-1.5 text-2xl font-bold capitalize tracking-[-0.03em] text-ap-accent">
                    {feedback.session_summary.overall_performance || 'Completed'}
                  </p>
                </div>
              )}

              {feedback.what_went_well?.length > 0 && (
                <div className="mt-5">
                  <p className={KICKER}>What went well</p>
                  <ul className="mt-2.5 flex flex-col gap-1.5">
                    {feedback.what_went_well.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 rounded-ap-sm border border-ap-line bg-ap-mint-soft px-3 py-2.5 text-sm leading-relaxed text-ap-ink-soft"
                      >
                        <span className="shrink-0 font-bold text-ap-mint">✓</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.areas_for_improvement?.length > 0 && (
                <div className="mt-5">
                  <p className={KICKER}>Areas to improve</p>
                  <ul className="mt-2.5 flex flex-col gap-1.5">
                    {feedback.areas_for_improvement.map((a, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 rounded-ap-sm border border-ap-line bg-ap-peach-soft px-3 py-2.5 text-sm leading-relaxed text-ap-ink-soft"
                      >
                        <span className="shrink-0 font-bold text-ap-peach">→</span>
                        <span>
                          <strong className="text-ap-ink">{a.area}: </strong>
                          {a.suggestion || a.issue || a}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setFeedback(null);
                  navigate('/');
                }}
                className={`${BTN} mt-6 w-full`}
              >
                Return home
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Debate;
