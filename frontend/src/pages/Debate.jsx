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

const PRIMARY = 'var(--clay-primary)';
const INK = 'var(--clay-ink)';
const INK_SOFT = 'var(--clay-ink-soft)';
const MUTED = 'var(--clay-muted)';

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
          <p style={{ margin: '0 0 0.6em 0', fontSize: '0.9rem', lineHeight: '1.75', color: INK_SOFT, fontFamily: 'inherit' }}>
            {children}
          </p>
        ),
        strong: ({ children }) => <strong style={{ fontWeight: 700, color: PRIMARY }}>{children}</strong>,
        em: ({ children }) => <em style={{ fontStyle: 'italic', color: INK_SOFT }}>{children}</em>,
        ul: ({ children }) => <ul style={{ margin: '0.35em 0 0.6em 0', paddingLeft: '1.25em', listStyleType: 'disc' }}>{children}</ul>,
        ol: ({ children }) => <ol style={{ margin: '0.35em 0 0.6em 0', paddingLeft: '1.35em', listStyleType: 'decimal' }}>{children}</ol>,
        li: ({ children }) => <li style={{ fontSize: '0.9rem', lineHeight: '1.65', color: INK_SOFT, fontFamily: 'inherit', marginBottom: '0.2em' }}>{children}</li>,
        blockquote: ({ children }) => (
          <blockquote style={{ borderLeft: '3px solid color-mix(in srgb, var(--clay-primary) 40%, transparent)', margin: '0.5em 0', paddingLeft: '0.9em', color: MUTED, fontStyle: 'italic' }}>
            {children}
          </blockquote>
        ),
        code: ({ inline, children, ...props }) =>
          inline ? (
            <code style={{ backgroundColor: 'var(--clay-primary-soft)', color: PRIMARY, borderRadius: '6px', padding: '2px 6px', fontSize: '0.8rem', fontFamily: 'monospace' }} {...props}>
              {children}
            </code>
          ) : (
            <pre style={{ backgroundColor: 'var(--clay-primary-soft)', borderRadius: '12px', padding: '12px 16px', overflowX: 'auto', margin: '0.55em 0' }}>
              <code style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: INK_SOFT }} {...props}>
                {children}
              </code>
            </pre>
          ),
        hr: () => <hr style={{ border: 'none', borderTop: '1px solid color-mix(in srgb, var(--clay-primary) 14%, transparent)', margin: '0.9em 0' }} />,
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
  analyzer:            { label: 'Analyzer',        icon: Search,     color: 'var(--clay-primary)', bg: 'var(--clay-primary-soft)', border: 'color-mix(in srgb, var(--clay-primary) 22%, transparent)' },
  researcher:          { label: 'Researcher',      icon: BookOpen,   color: 'var(--clay-blue)',    bg: 'var(--clay-blue-soft)',    border: 'color-mix(in srgb, var(--clay-blue) 24%, transparent)' },
  socratic_questioner: { label: 'Socratic',        icon: HelpCircle, color: 'var(--clay-gold)',    bg: 'var(--clay-gold-soft)',    border: 'color-mix(in srgb, var(--clay-gold) 24%, transparent)' },
  devils_advocate:     { label: "Devil's Advocate", icon: Flame,     color: 'var(--clay-peach)',   bg: 'var(--clay-peach-soft)',   border: 'color-mix(in srgb, var(--clay-peach) 24%, transparent)' },
};

function MessageInsights({ insights }) {
  const [openAgent, setOpenAgent] = useState(null);
  const active = Object.entries(insights).filter(([, v]) => v !== null);
  if (active.length === 0) return null;
  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap gap-2">
        {active.map(([agent]) => {
          const cfg = AGENT_CONFIG[agent];
          if (!cfg) return null;
          const Icon = cfg.icon;
          const isOpen = openAgent === agent;
          return (
            <motion.button
              key={agent}
              onClick={() => setOpenAgent(isOpen ? null : agent)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="clay-chip flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all"
              style={{ backgroundColor: isOpen ? cfg.color : undefined, color: isOpen ? 'var(--clay-on-primary)' : cfg.color, boxShadow: isOpen ? `5px 5px 14px ${cfg.border}` : undefined }}
            >
              <Icon size={11} />
              {cfg.label}
              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={11} />
              </motion.div>
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {openAgent && insights[openAgent] && (
          <motion.div
            key={openAgent}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="clay-inset rounded-2xl p-4" style={{ borderLeft: `3px solid ${AGENT_CONFIG[openAgent]?.color}` }}>
              {openAgent === 'analyzer' && <AnalyzerDetail output={insights.analyzer} />}
              {openAgent === 'researcher' && <ResearcherDetail output={insights.researcher} />}
              {openAgent === 'socratic_questioner' && <SocraticDetail output={insights.socratic_questioner} />}
              {openAgent === 'devils_advocate' && <AdvocateDetail output={insights.devils_advocate} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AnalyzerDetail({ output }) {
  let data;
  try { data = typeof output === 'string' ? JSON.parse(output) : output; } catch { return null; }
  return (
    <div className="space-y-3">
      {data.argument_strength && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold" style={{ color: PRIMARY, fontFamily: 'inherit' }}>Argument Quality</p>
            <span className="text-sm font-black" style={{ color: PRIMARY, fontFamily: 'inherit' }}>{data.argument_strength.overall_score}/10</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--clay-bg-deep)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(data.argument_strength.overall_score / 10) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: data.argument_strength.overall_score >= 7 ? 'var(--clay-mint)' : data.argument_strength.overall_score >= 5 ? 'var(--clay-gold)' : 'var(--clay-peach)' }}
            />
          </div>
          {data.argument_strength.breakdown && <p className="text-xs mt-1.5" style={{ color: MUTED, fontFamily: 'inherit' }}>{data.argument_strength.breakdown}</p>}
        </div>
      )}
      {data.fallacies_detected?.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-1.5" style={{ color: PRIMARY, fontFamily: 'inherit' }}>Logical Issues</p>
          {data.fallacies_detected.map((f, i) => (
            <div key={i} className="p-2.5 rounded-xl mb-1.5" style={{ backgroundColor: f.severity === 'severe' ? 'var(--clay-peach-soft)' : 'var(--clay-gold-soft)' }}>
              <p className="text-xs font-semibold capitalize" style={{ color: INK, fontFamily: 'inherit' }}>{f.type?.replace(/_/g, ' ')}</p>
              <p className="text-xs mt-0.5" style={{ color: INK_SOFT, fontFamily: 'inherit' }}>{f.explanation}</p>
            </div>
          ))}
        </div>
      )}
      {data.implicit_assumptions?.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: PRIMARY, fontFamily: 'inherit' }}>Assumptions</p>
          {data.implicit_assumptions.slice(0, 2).map((a, i) => (
            <p key={i} className="text-xs mb-0.5" style={{ color: INK_SOFT, fontFamily: 'inherit' }}>· {a.assumption || a}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function ResearcherDetail({ output }) {
  let data;
  try { data = typeof output === 'string' ? JSON.parse(output) : output; } catch { return null; }
  const supporting = data.supporting_evidence || [], opposing = data.opposing_evidence || [];
  const sc = data.overall_evidence_strength
    ? {
        strong_support: { label: 'Strong Support', color: 'var(--clay-mint)', Icon: TrendingUp },
        mixed: { label: 'Mixed Evidence', color: 'var(--clay-gold)', Icon: Minus },
        strong_opposition: { label: 'Mostly Against', color: 'var(--clay-peach)', Icon: TrendingDown },
      }[data.overall_evidence_strength]
    : null;
  return (
    <div className="space-y-3">
      {sc && (
        <div className="flex items-center gap-2">
          <sc.Icon size={14} color={sc.color} />
          <p className="text-xs font-semibold" style={{ color: sc.color, fontFamily: 'inherit' }}>
            {sc.label} · {data.total_sources_found || 0} sources
          </p>
        </div>
      )}
      {data.strongest_source && (
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--clay-blue)', fontFamily: 'inherit' }}>Most Credible</p>
          <p className="text-xs" style={{ color: INK, fontFamily: 'inherit' }}>{data.strongest_source.title || data.strongest_source.source_name}</p>
        </div>
      )}
      {supporting.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--clay-mint)', fontFamily: 'inherit' }}>Supporting ({supporting.length})</p>
          {supporting.slice(0, 2).map((ev, i) => (
            <div key={i} className="p-2.5 rounded-xl mb-1.5" style={{ backgroundColor: 'var(--clay-mint-soft)' }}>
              <p className="text-xs font-medium" style={{ color: INK, fontFamily: 'inherit' }}>{ev.source_name}</p>
              {ev.key_finding && <p className="text-xs mt-0.5" style={{ color: INK_SOFT, fontFamily: 'inherit' }}>{ev.key_finding}</p>}
            </div>
          ))}
        </div>
      )}
      {opposing.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--clay-peach)', fontFamily: 'inherit' }}>Opposing ({opposing.length})</p>
          {opposing.slice(0, 2).map((ev, i) => (
            <div key={i} className="p-2.5 rounded-xl mb-1.5" style={{ backgroundColor: 'var(--clay-peach-soft)' }}>
              <p className="text-xs font-medium" style={{ color: INK, fontFamily: 'inherit' }}>{ev.source_name}</p>
              {ev.key_finding && <p className="text-xs mt-0.5" style={{ color: INK_SOFT, fontFamily: 'inherit' }}>{ev.key_finding}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SocraticDetail({ output }) {
  let data;
  try { data = typeof output === 'string' ? JSON.parse(output) : output; } catch { return null; }
  return (
    <div className="space-y-2">
      {data.questions?.map((q, i) => (
        <div key={i} className="p-2.5 rounded-xl" style={{ backgroundColor: 'var(--clay-gold-soft)' }}>
          <p className="text-xs font-medium" style={{ color: INK, fontFamily: 'inherit' }}>{q.question_text || q}</p>
          {q.question_type && <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--clay-gold)', fontFamily: 'inherit' }}>{q.question_type.replace(/_/g, ' ')}</p>}
        </div>
      ))}
    </div>
  );
}

function AdvocateDetail({ output }) {
  let data;
  try { data = typeof output === 'string' ? JSON.parse(output) : output; } catch { return null; }
  return (
    <div className="space-y-2">
      {data.opposing_position && (
        <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'var(--clay-peach-soft)' }}>
          <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--clay-peach)', fontFamily: 'inherit' }}>Counter-Position</p>
          <p className="text-xs" style={{ color: INK, fontFamily: 'inherit' }}>{data.opposing_position.statement || data.opposing_position}</p>
        </div>
      )}
      {data.counter_arguments?.slice(0, 2).map((arg, i) => (
        <div key={i} className="p-2.5 rounded-xl" style={{ backgroundColor: 'var(--clay-peach-soft)' }}>
          <p className="text-xs font-semibold capitalize" style={{ color: 'var(--clay-peach)', fontFamily: 'inherit' }}>{arg.type?.replace(/_/g, ' ')}</p>
          <p className="text-xs mt-0.5" style={{ color: INK_SOFT, fontFamily: 'inherit' }}>{arg.argument}</p>
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
  const [feedback, setFeedback] = useState(null);
  const [currentStream, setCurrentStream] = useState(null);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const pendingInsightsRef = useRef({ analyzer: null, researcher: null, socratic_questioner: null, devils_advocate: null });
  const messagesEndRef = useRef(null);

  const topic = location.state?.topic || 'Debate Topic';
  const difficulty = location.state?.difficulty || 'standard';
  const turnCount = Math.floor(messages.length / 2);

  const difficultyColor = { casual: 'var(--clay-mint)', standard: 'var(--clay-gold)', expert: 'var(--clay-peach)' }[difficulty] || 'var(--clay-gold)';

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    const loadPreviousMessages = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/user/debate/${sessionId}/turns`);
        const data = await res.json();
        setMessages(data.turns.flatMap((t) => [
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
        ]));
      } catch (error) { console.error(error); }
    };

    loadPreviousMessages();
  }, [sessionId]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    setMessages((p) => [...p, { role: 'user', content: input }]);
    const userInput = input;
    setInput('');
    setIsLoading(true);
    pendingInsightsRef.current = { analyzer: null, researcher: null, socratic_questioner: null, devils_advocate: null };
    const idx = messages.length + 1;
    setMessages((p) => [...p, { role: 'assistant', content: '', insights: null }]);
    try {
      const stream = new DebateStream(sessionId, userInput, {
        onToken: (token) => setMessages((p) => {
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
    } catch { setIsLoading(false); }
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
    } catch { alert('Failed to send message'); }
  };

  const handleEndDebate = async () => {
    if (!confirm('End this debate?')) return;
    try {
      await debateService.endDebate(sessionId);
      navigate('/');
    } catch { alert('Failed to end debate'); }
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
    return () => { if (currentStream) currentStream.close(); };
  }, [currentStream]);

  return (
    <div className="h-screen flex flex-col overflow-hidden clay-bg">
      {/* ================================================================
          HEADER
      ================================================================ */}
      <div className="shrink-0 px-4 sm:px-8 pt-5">
        <div className="clay-card max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          {/* LEFT */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="clay-avatar w-10 h-10 shrink-0">
              <AnimatePresence mode="wait">
                {currentAgent ? (
                  <motion.div key="a" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}>
                    <Zap size={16} color="var(--clay-on-primary)" fill="var(--clay-on-primary)" />
                  </motion.div>
                ) : (
                  <motion.div key="b" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Zap size={16} color="var(--clay-on-primary)" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="min-w-0">
              <h2
                className="font-display leading-tight truncate text-[clamp(1rem,2vw,1.3rem)]"
                style={{ color: INK, maxWidth: '46vw' }}
              >
                {topic}
              </h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize"
                  style={{ backgroundColor: `color-mix(in srgb, ${difficultyColor} 16%, transparent)`, color: difficultyColor }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: difficultyColor }} />
                  {difficulty}
                </span>
                <span className="clay-chip px-2.5 py-0.5 text-[11px] font-semibold" style={{ color: MUTED }}>
                  Turn {turnCount}
                </span>
                <AnimatePresence>
                  {currentAgent && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                      style={{ backgroundColor: 'var(--clay-mint-soft)', color: 'var(--clay-mint)' }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--clay-mint)' }} />
                      {currentAgent.replace(/_/g, ' ')}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />

            <motion.button
              onClick={() => setIsHistoryOpen(true)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="clay-btn-soft px-3.5 py-2.5 rounded-2xl text-sm font-medium"
              style={{ color: INK_SOFT }}
            >
              <History size={15} />
              <span className="hidden sm:inline text-xs">History</span>
            </motion.button>

            <div className="w-px h-6" style={{ backgroundColor: 'var(--clay-bg-deep)' }} />

            <motion.button
              onClick={handleEndDebate}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="clay-btn-soft px-3.5 py-2.5 rounded-2xl text-xs font-semibold"
              style={{ color: 'var(--clay-ink-soft)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--clay-danger)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--clay-ink-soft)'; }}
            >
              <span className="hidden sm:inline">End Debate</span>
              <span className="sm:hidden">End</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* ================================================================
          MESSAGES
      ================================================================ */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex mb-7 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="clay-avatar w-9 h-9 text-[11px] font-bold shrink-0 mr-3 mt-1">AI</div>
                )}

                <div className={msg.role === 'user' ? 'max-w-[80%]' : 'flex-1 min-w-0'}>
                  <div
                    className={msg.role === 'user' ? 'clay-inset-primary px-5 py-4 inline-block max-w-full' : 'clay-card-sm px-5 py-4'}
                    style={msg.role === 'user' ? { borderBottomRightRadius: '8px' } : { borderBottomLeftRadius: '8px' }}
                  >
                    {msg.role === 'assistant' ? (
                      msg.content ? (
                        <MarkdownMessage content={msg.content} />
                      ) : (
                        <span style={{ color: MUTED, fontSize: '0.9rem' }}>…</span>
                      )
                    ) : (
                      <p className="whitespace-pre-wrap text-[0.9rem] leading-relaxed" style={{ color: 'var(--bubble-color)', fontFamily: 'inherit' }}>
                        {msg.content}
                      </p>
                    )}
                  </div>
                  {msg.role === 'assistant' && msg.insights && <MessageInsights insights={msg.insights} />}
                </div>

                {msg.role === 'user' && (
                  <div className="clay-avatar-soft w-9 h-9 text-[11px] font-bold shrink-0 ml-3 mt-1">
                    U
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && messages[messages.length - 1]?.content === '' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start mb-6">
              <div className="clay-avatar w-9 h-9 text-[11px] font-bold shrink-0 mr-3 mt-1">AI</div>
              <div className="clay-card-sm px-5 py-4 flex items-center gap-2">
                {[0, 0.18, 0.36].map((d, i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 0.9, delay: d }}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: PRIMARY }}
                  />
                ))}
                {statusMessage && (
                  <span className="text-xs ml-2" style={{ color: MUTED, fontFamily: 'inherit' }}>
                    {statusMessage}
                  </span>
                )}
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ================================================================
          INPUT
      ================================================================ */}
      <div className="shrink-0 px-4 sm:px-8 pb-6 pt-1">
        <div className="max-w-3xl mx-auto clay-card p-3 flex items-end gap-2.5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your argument…"
            disabled={isLoading}
            rows={1}
            className="clay-input flex-1 resize-none px-4 py-3.5 text-sm disabled:opacity-50"
            style={{ fontFamily: 'inherit' }}
          />
          <motion.button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            whileHover={!isLoading && input.trim() ? { y: -2 } : {}}
            whileTap={!isLoading && input.trim() ? { scale: 0.96 } : {}}
            className="clay-btn px-5 py-3.5 text-sm font-bold tracking-[0.04em] uppercase shrink-0"
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>
                <span className="hidden sm:inline">Send</span>
                <ArrowUp size={17} />
              </>
            )}
          </motion.button>
        </div>
        <p className="mt-2.5 text-[11px] text-center" style={{ color: MUTED, fontFamily: 'inherit' }}>
          Enter to send · Shift + Enter for a new line
        </p>
      </div>

      {/* ================================================================
          HISTORY SIDEBAR
      ================================================================ */}
      <PreviousDebatesSidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectDebate={handleSelectDebate}
      />

      {/* ================================================================
          FEEDBACK MODAL
      ================================================================ */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            style={{ backgroundColor: 'rgba(11,17,32,0.55)', backdropFilter: 'blur(10px)' }}
            onClick={() => { setFeedback(null); navigate('/'); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="clay-card max-w-2xl w-full max-h-[82vh] overflow-y-auto p-7 sm:p-8"
            >
              <div className="clay-avatar w-12 h-12 mb-5">
                <Zap size={20} />
              </div>

              <h2 className="font-display mb-6 text-[clamp(1.8rem,4vw,2.5rem)] leading-tight" style={{ color: INK }}>
                Debate complete
              </h2>

              <div className="space-y-5">
                {feedback.session_summary && (
                  <div className="clay-inset rounded-2xl p-4">
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: MUTED, fontFamily: 'inherit' }}>
                      Overall performance
                    </p>
                    <p className="text-2xl font-display capitalize" style={{ color: PRIMARY }}>
                      {feedback.session_summary.overall_performance || 'Completed'}
                    </p>
                  </div>
                )}

                {feedback.what_went_well?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: PRIMARY, fontFamily: 'inherit' }}>
                      What went well
                    </p>
                    <ul className="space-y-2">
                      {feedback.what_went_well.map((s, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm rounded-xl p-2.5" style={{ color: INK_SOFT, fontFamily: 'inherit', backgroundColor: 'var(--clay-mint-soft)' }}>
                          <span style={{ color: 'var(--clay-mint)', flexShrink: 0, fontWeight: 700 }}>✓</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {feedback.areas_for_improvement?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: PRIMARY, fontFamily: 'inherit' }}>
                      Areas to improve
                    </p>
                    <ul className="space-y-2">
                      {feedback.areas_for_improvement.map((a, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm rounded-xl p-2.5" style={{ color: INK_SOFT, fontFamily: 'inherit', backgroundColor: 'var(--clay-peach-soft)' }}>
                          <span style={{ color: 'var(--clay-peach)', flexShrink: 0, fontWeight: 700 }}>→</span>
                          <span><strong style={{ color: INK }}>{a.area}: </strong>{a.suggestion || a.issue || a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <motion.button
                onClick={() => { setFeedback(null); navigate('/'); }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="clay-btn mt-7 w-full py-4 text-sm font-bold tracking-[0.06em] uppercase"
              >
                Return home
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Debate;
