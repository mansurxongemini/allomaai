"use client"

import { useState, useRef, useEffect, useCallback, useMemo, Fragment } from "react"
import {
  MessageCircle,
  Send,
  PlusCircle,
  AlertCircle,
  Wand2,
  Lightbulb,
  Sparkles,
  Trash2,
  Clock,
  BookOpen,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PROMPT_TIP_DELIMITER, DOSYE_DELIMITER } from "@/lib/ai/constants"
import { useChat } from "@ai-sdk/react"
import type { UIMessage } from "ai"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useAuth } from "@/context/AuthContext"
import {
  ChatSession,
  subscribeToUserChats,
  createChatSession,
  updateChatMessages,
  updateChatMode,
  deleteChatSession
} from "@/lib/firebase/chats"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { useChatContextOptions } from "@/hooks/useChatContextOptions"
import { useAutosave } from "@/hooks/useAutosave"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type RoleMode = "default" | "learning" | "professor" | "friend" | "custom"
type ChatMode = "personal" | "professor" | "caseAnalyzer"
const CHAT_MODE_STORAGE_KEY = "ai-couch-chat-mode"
type IracStep = "issue" | "rule" | "application" | "conclusion"

type RAGSource = {
  id: string
  title: string
  snippet: string
  similarity: number | null
  sourceId: string | null
  sourceType: string | null
}

type HintLadder = {
  feedback: string
  score: "A" | "B" | "C"
  isCorrect: boolean
  levels: [string, string, string]
  revealedLevel: 0 | 1 | 2 | 3
}

const HINT_COSTS = [5, 10, 20] as const

/** Convert legacy messages (with `content` string) to UIMessage format (with `parts`) */
function toUIMessages(msgs: any[]): UIMessage[] {
  return msgs.map((msg) => {
    if (msg.parts) return msg as UIMessage
    return {
      id: msg.id || crypto.randomUUID(),
      role: msg.role,
      parts: [{ type: "text" as const, text: msg.content || "" }],
    }
  })
}

/* ------------------------------------------------------------------ */
/* Suggestion Chips                                                    */
/* ------------------------------------------------------------------ */
const SUGGESTIONS = [
  { icon: Lightbulb, text: "Mulk huquqi nima?" },
  { icon: Wand2, text: "Shartnoma tuzish qoidalari" },
  { icon: Sparkles, text: "Sud jarayonini tushuntir" },
]

/* ------------------------------------------------------------------ */
/* Citation Pill                                                       */
/* ------------------------------------------------------------------ */
function CitationPill({ num }: { num: string }) {
  return (
    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md mx-0.5 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-700 dark:hover:text-blue-300 transition-colors align-middle leading-none select-none">
      {num}
    </span>
  )
}

function processCitations(text: string): React.ReactNode[] {
  const parts = text.split(/(\[\d+\])/g)
  if (parts.length === 1) return [text]
  return parts
    .map((part, i) => {
      const m = part.match(/^\[(\d+)\]$/)
      if (m) return <CitationPill key={i} num={m[1]} />
      if (part === "") return null
      return part
    })
    .filter(Boolean) as React.ReactNode[]
}

function processChildren(children: React.ReactNode): React.ReactNode {
  if (typeof children === "string") {
    const result = processCitations(children)
    return result.length === 1 && typeof result[0] === "string" ? result[0] : <Fragment>{result}</Fragment>
  }
  if (Array.isArray(children)) {
    return children.map((child, i) => {
      if (typeof child === "string") {
        const result = processCitations(child)
        return result.length === 1 && typeof result[0] === "string" ? result[0] : <Fragment key={i}>{result}</Fragment>
      }
      return child
    })
  }
  return children
}

/* ------------------------------------------------------------------ */
/* Markdown Components вЂ” NotebookLM Typography                        */
/* ------------------------------------------------------------------ */
const markdownComponents: Record<string, React.ComponentType<any>> = {
  p: ({ children }: any) => (
    <p className="my-2.5 leading-[1.8] text-slate-700 dark:text-slate-300">
      {processChildren(children)}
    </p>
  ),
  li: ({ children }: any) => (
    <li className="my-1 text-slate-700 dark:text-slate-300 leading-[1.75]">
      {processChildren(children)}
    </li>
  ),
  strong: ({ children }: any) => (
    <strong className="font-semibold text-slate-800 dark:text-slate-200">
      {processChildren(children)}
    </strong>
  ),
  h1: ({ children }: any) => (
    <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mt-6 mb-2">{children}</h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mt-5 mb-2">{children}</h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mt-4 mb-1.5">{children}</h3>
  ),
  ul: ({ children }: any) => <ul className="list-disc pl-5 my-2.5 space-y-1">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal pl-5 my-2.5 space-y-1">{children}</ol>,
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-blue-300 dark:border-blue-700 pl-4 italic my-3 text-slate-600 dark:text-slate-400">
      {children}
    </blockquote>
  ),
  pre: ({ children }: any) => (
    <pre className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 overflow-x-auto text-sm font-mono my-3">
      {children}
    </pre>
  ),
  code: ({ className, children }: any) => {
    if (className?.startsWith("language-")) {
      return <code className={cn("font-mono text-sm", className)}>{children}</code>
    }
    return (
      <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800 dark:text-slate-200">
        {children}
      </code>
    )
  },
  a: ({ href, children }: any) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 no-underline hover:underline">
      {children}
    </a>
  ),
}

/* ------------------------------------------------------------------ */
/* NotebookLM-style Message                                            */
/* ------------------------------------------------------------------ */
function getMessageText(message: UIMessage): string {
  return message.parts
    ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("") ?? ""
}

/** Strip the technical [KAZUS FAKTLARI] + [KAZUS TAHLILI] wrapper so users see only their raw input */
function cleanUserMessageText(raw: string): string {
  return raw
    .replace(/\[KAZUS FAKTLARI\][\s\S]*?Talaba yozgan matn:\s*\n?/g, "")
    .replace(/^\[KAZUS TAHLILI\s*-\s*[A-Z]+\]\s*Talaba yozgan matn:\s*/i, "")
    .replace(/QAT'IY KO'RSATMA:[\s\S]*/g, "")
    .replace(/^"+|"+$/g, "")
    .trim()
}

/** Strip hidden [UNLOCK] trigger from AI messages */
function cleanAssistantMessageText(raw: string): string {
  return raw.replace(/\[UNLOCK\]/g, "").replace(/\[SUCCESS\]/g, "").trim()
}

function NotebookMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === "user"
  const text = getMessageText(message)

  if (isUser) {
    const displayText = cleanUserMessageText(text)
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end mb-6"
      >
        <div className="max-w-[78%] px-4 py-3 rounded-2xl bg-slate-100 dark:bg-[#2a2f3a] text-slate-800 dark:text-slate-200 text-[15px] leading-relaxed whitespace-pre-wrap">
          {displayText}
        </div>
      </motion.div>
    )
  }

  // Robust 3-part parsing — gracefully handles mid-stream states where
  // delimiters may not have arrived yet.
  // dosyeData is intentionally NOT captured here — the server already
  // extracts and persists it in the onFinish callback (zero extra API calls).
  const rawText = text
  let mainText = rawText
  let promptTip = ""

  if (rawText.includes(PROMPT_TIP_DELIMITER)) {
    const parts = rawText.split(PROMPT_TIP_DELIMITER)
    mainText = parts[0]
    const remaining = parts[1]
    if (remaining.includes(DOSYE_DELIMITER)) {
      promptTip = remaining.split(DOSYE_DELIMITER)[0].trim()
    } else {
      promptTip = remaining.trim()
    }
  } else if (rawText.includes(DOSYE_DELIMITER)) {
    // Strip DOSYE section to prevent it from leaking into rendered text
    mainText = rawText.split(DOSYE_DELIMITER)[0]
  }

  const showTip = promptTip.length > 0 && promptTip.toUpperCase() !== "NONE"

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3.5 mb-8"
    >
      <div className="shrink-0 mt-0.5">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 via-violet-500 to-amber-400 flex items-center justify-center shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {cleanAssistantMessageText(mainText.trim())}
        </ReactMarkdown>
        {showTip && (
          <div className="mt-6 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
              <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                AI Murabbiy Maslahati
              </span>
            </div>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
              {promptTip}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Typing Indicator                                                    */
/* ------------------------------------------------------------------ */
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex gap-3.5 mb-6"
    >
      <div className="shrink-0">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 via-violet-500 to-amber-400 flex items-center justify-center shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
      <div className="flex items-center gap-1.5 pt-1.5">
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Welcome / Empty State                                               */
/* ------------------------------------------------------------------ */
function WelcomeState({
  onSuggestionClick,
  chatMode,
}: {
  onSuggestionClick: (text: string) => void
  chatMode: ChatMode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="flex flex-col items-center justify-center flex-1 text-center px-4 py-20"
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-violet-500 to-amber-400 flex items-center justify-center mb-6 shadow-lg">
        <Sparkles className="w-6 h-6 text-white" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-slate-100 mb-2 tracking-tight">
        {chatMode === "professor"
          ? "Darsni boshlaylik!"
          : "Assalomu alaykum!"}
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-base mb-10">
        {chatMode === "professor"
          ? "Huquqiy savolingizni aniq va to'liq yozing"
          : "Huquqiy savolingizni bering"}
      </p>

      <div className="flex flex-wrap justify-center gap-2.5 max-w-xl">
        {SUGGESTIONS.map((s, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.08 }}
            onClick={() => onSuggestionClick(s.text)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium bg-white dark:bg-[#2a2f3a] border border-slate-200 dark:border-[#3c4043] text-slate-600 dark:text-slate-400 hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-700 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all shadow-sm"
          >
            <s.icon className="w-3.5 h-3.5 text-blue-500" />
            {s.text}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

function getModeLabel(mode: ChatMode) {
  if (mode === "professor") return "Professor"
  if (mode === "caseAnalyzer") return "Kazus Tahlilchi"
  return "Shaxsiy yordamchi"
}

/* ------------------------------------------------------------------ */
/* Case Analyzer Workspace                                             */
/* ------------------------------------------------------------------ */
function CaseWorkspace({
  activeIracStep,
  setActiveIracStep,
  iracDraft,
  setIracDraft,
  caseText,
  setCaseText,
  isCaseLocked,
  setIsCaseLocked,
  onEvaluateStep,
  onRequestHint,
  isCheckingStep,
  isHintLoading,
  hintLadders,
  onSubmitToChat,
  isChatLoading,
}: {
  activeIracStep: IracStep
  setActiveIracStep: (step: IracStep) => void
  iracDraft: Record<IracStep, string>
  setIracDraft: React.Dispatch<React.SetStateAction<Record<IracStep, string>>>
  caseText: string
  setCaseText: React.Dispatch<React.SetStateAction<string>>
  isCaseLocked: boolean
  setIsCaseLocked: React.Dispatch<React.SetStateAction<boolean>>
  onEvaluateStep: (step: IracStep) => Promise<boolean>
  onRequestHint: (step: IracStep) => Promise<void>
  isCheckingStep: boolean
  isHintLoading: boolean
  hintLadders: Partial<Record<IracStep, HintLadder>>
  onSubmitToChat: (msg: { role: string; content: string }) => void
  isChatLoading: boolean
}) {
  const sections: { key: IracStep; title: string }[] = [
    { key: "issue", title: "Muammo (Issue)" },
    { key: "rule", title: "Qoida (Rule)" },
    { key: "application", title: "Tahlil (Application)" },
    { key: "conclusion", title: "Xulosa (Conclusion)" },
  ]

  const [editingStep, setEditingStep] = useState<IracStep | null>(null)
  const order: IracStep[] = ["issue", "rule", "application", "conclusion"]
  const activeIndex = order.indexOf(activeIracStep)

  // Notion-style auto-resize
  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }

  return (
    <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-10 flex flex-col gap-8 h-full overflow-y-auto">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">Kazus Tahlili</h1>
        <hr />
      </header>

      {/* Step 1: Kazus matni */}
      <section>
        <h3 className="text-xl font-semibold flex items-center gap-3 mb-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm">1</span>
          Kazus matni
        </h3>
        {!isCaseLocked ? (
          <textarea
            value={caseText}
            onChange={e => {
              setCaseText(e.target.value)
              autoResize(e.currentTarget)
            }}
            onInput={e => autoResize(e.currentTarget)}
            rows={3}
            placeholder="Kazus faktlarini batafsil kiriting..."
            className="w-full min-h-[100px] bg-slate-50 dark:bg-slate-900/50 border-l-4 border-primary pl-4 py-3 text-lg outline-none resize-none"
          />
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCaseLocked(false)}
              className="text-xs text-slate-400 hover:text-primary transition-colors cursor-pointer absolute top-0 right-0"
            >
              Tahrirlash
            </button>
            <p className="text-lg text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{caseText}</p>
          </div>
        )}
        {!isCaseLocked && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!caseText.trim()) {
                  toast.error("Avval kazus matnini kiriting")
                  return
                }
                setIsCaseLocked(true)
                setActiveIracStep("issue")
              }}
              className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Tasdiqlash va Boshlash
            </button>
          </div>
        )}
      </section>

      {/* IRAC Steps */}
      {sections.map((section, idx) => {
        const isActive = isCaseLocked && activeIracStep === section.key
        const isDone = isCaseLocked && order.indexOf(section.key) < activeIndex
        const isFuture = isCaseLocked && order.indexOf(section.key) > activeIndex && editingStep !== section.key
        const isEditingDoneStep = editingStep === section.key && isDone
        // Only show if unlocked or completed
        if (!isCaseLocked || isFuture) {
          return (
            <section key={section.key} className="opacity-30 grayscale pointer-events-none select-none">
              <h3 className="text-xl font-semibold flex items-center gap-3 mb-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm">{idx + 2}</span>
                {section.title}
              </h3>
            </section>
          )
        }
        return (
          <section key={section.key}>
            <h3 className="text-xl font-semibold flex items-center gap-3 mb-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm">{idx + 2}</span>
              {section.title}
            </h3>
            {(isActive || isEditingDoneStep) ? (
              <>
                <textarea
                  value={iracDraft[section.key]}
                  onChange={e => {
                    setIracDraft(prev => ({ ...prev, [section.key]: e.target.value }))
                    autoResize(e.currentTarget)
                  }}
                  onInput={e => autoResize(e.currentTarget)}
                  rows={3}
                  placeholder="Yozishni boshlang..."
                  className="w-full min-h-[100px] bg-slate-50 dark:bg-slate-900/50 border-l-4 border-primary pl-4 py-3 text-lg outline-none resize-none"
                />
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    disabled={isChatLoading}
                    onClick={() => {
                      onSubmitToChat({
                        role: 'user',
                        content: `[KAZUS FAKTLARI]:\n"${caseText}"\n\n[KAZUS TAHLILI - ${section.key.toUpperCase()}] Talaba yozgan matn:\n"${iracDraft[section.key]}"\n\nQAT'IY KO'RSATMA: Faqatgina yuqoridagi [KAZUS FAKTLARI] ga asoslanib, talabaning tahlilini bahola. Boshqa kazuslarni (masalan, "Botirning merosi") umuman aralashtirma!`
                      })
                    }}
                    className={cn(
                      "rounded-full px-4 py-2 text-xs font-semibold transition-colors",
                      isChatLoading
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    )}
                  >
                    {isChatLoading ? "AI Tekshirmoqda..." : "Tekshirish"}
                  </button>
                </div>
              </>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setEditingStep(section.key)
                    setActiveIracStep(section.key)
                  }}
                  className="text-xs text-slate-400 hover:text-primary transition-colors cursor-pointer absolute top-0 right-0"
                >
                  Tahrirlash
                </button>
                <p className="text-lg text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{iracDraft[section.key] || "—"}</p>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Couch Page                                                          */
/* ------------------------------------------------------------------ */
export default function CouchPage() {
  const { currentUser } = useAuth()
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const hasInitializedSession = useRef(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Context selection
  const [selectedTopic, setSelectedTopic] = useState<string>("general")
  const [chatMode, setChatMode] = useState<ChatMode>("personal")
  const [activeIracStep, setActiveIracStep] = useState<IracStep>("issue")
  const [caseText, setCaseText] = useState("")
  const [isCaseLocked, setIsCaseLocked] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [hasRestoredCaseDraft, setHasRestoredCaseDraft] = useState(false)
  const [iracDraft, setIracDraft] = useState<Record<IracStep, string>>({
    issue: "",
    rule: "",
    application: "",
    conclusion: "",
  })
  const { groups: contextGroups, isLoading: isContextLoading } = useChatContextOptions()

  // Stable refs so that useChat callback identity doesn't change on every render
  const activeSessionIdRef = useRef<string | null>(null)
  const currentUserRef = useRef(currentUser)

  useEffect(() => { activeSessionIdRef.current = activeSessionId }, [activeSessionId])
  useEffect(() => { currentUserRef.current = currentUser }, [currentUser])

  const [fetchError, setFetchError] = useState<string | null>(null)
  const [hintCostSpent, setHintCostSpent] = useState(0)
  const [isCheckingStep, setIsCheckingStep] = useState(false)
  const [isHintLoading, setIsHintLoading] = useState(false)
  const [hintLadders, setHintLadders] = useState<Partial<Record<IracStep, HintLadder>>>({})
  const [input, setInput] = useState("")
  const isCaseAnalyzerMode = chatMode === "caseAnalyzer"
  const caseDraftStorageKey = useMemo(
    () => `allomaai:case-analyzer:${currentUser?.uid ?? "guest"}`,
    [currentUser?.uid]
  )

  const resizeTextarea = useCallback(() => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = "auto"
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, isCaseAnalyzerMode ? 140 : 200)}px`
  }, [isCaseAnalyzerMode])

  const handleInputChange = useCallback((value: string) => {
    setInput(value)
    requestAnimationFrame(() => {
      resizeTextarea()
    })
  }, [resizeTextarea])

  useEffect(() => {
    setIsClient(true)

    try {
      const saved = localStorage.getItem(CHAT_MODE_STORAGE_KEY)
      if (saved === "personal" || saved === "professor" || saved === "caseAnalyzer") {
        setChatMode(saved)
      }
    } catch (err) {
      console.warn("[couch] Failed to read chat mode from localStorage:", err)
    }
  }, [])

  useEffect(() => {
    if (!isClient || typeof window === "undefined") return

    try {
      const raw = window.localStorage.getItem(caseDraftStorageKey)
      if (!raw) {
        setHasRestoredCaseDraft(true)
        return
      }

      const parsed = JSON.parse(raw) as {
        caseText?: string
        isCaseLocked?: boolean
        activeIracStep?: IracStep
        iracDraft?: Partial<Record<IracStep, string>>
        savedAt?: string
      }

      if (typeof parsed.caseText === "string") setCaseText(parsed.caseText)
      if (typeof parsed.isCaseLocked === "boolean") setIsCaseLocked(parsed.isCaseLocked)
      if (parsed.activeIracStep) setActiveIracStep(parsed.activeIracStep)
      if (parsed.iracDraft) {
        setIracDraft({
          issue: parsed.iracDraft.issue ?? "",
          rule: parsed.iracDraft.rule ?? "",
          application: parsed.iracDraft.application ?? "",
          conclusion: parsed.iracDraft.conclusion ?? "",
        })
      }
      if (parsed.savedAt) setLastSavedAt(parsed.savedAt)
    } catch (error) {
      console.error("Failed to restore case analyzer draft", error)
    } finally {
      setHasRestoredCaseDraft(true)
    }
  }, [caseDraftStorageKey, isClient])

  useEffect(() => {
    if (!isClient) return
    try {
      localStorage.setItem(CHAT_MODE_STORAGE_KEY, chatMode)
    } catch (err) {
      console.warn("[couch] Failed to save chat mode to localStorage:", err)
    }
  }, [chatMode, isClient])

  const saveCaseAnalyzerDraft = useCallback(async (nextDraft: {
    caseText: string
    isCaseLocked: boolean
    activeIracStep: IracStep
    iracDraft: Record<IracStep, string>
  }) => {
    if (typeof window === "undefined") return

    const savedAt = new Date().toISOString()
    window.localStorage.setItem(
      caseDraftStorageKey,
      JSON.stringify({ ...nextDraft, savedAt })
    )
    setLastSavedAt(savedAt)
  }, [caseDraftStorageKey])

  useAutosave(
    hasRestoredCaseDraft && isCaseAnalyzerMode
      ? { caseText, isCaseLocked, activeIracStep, iracDraft }
      : null,
    saveCaseAnalyzerDraft,
    5000
  )

  // Memoize callbacks so that useChat does not see a new options object on
  // every render, which could trigger unnecessary internal re-initializations.
  // Ref to track the last message ID that triggered an unlock – prevents
  // duplicate unlocks when messages array reference changes.
  const lastUnlockedMsgId = useRef<string | null>(null)

  const handleFinish = useCallback(({ messages: allMessages }: { messages: unknown[] }) => {
    setFetchError(null)
    if (activeSessionIdRef.current && currentUserRef.current) {
      updateChatMessages(activeSessionIdRef.current, allMessages as unknown as any[])
    }
  }, [])

  const handleError = useCallback((err: unknown) => {
    console.error("Chat error:", err)
    const errorMsg = err instanceof Error ? err.message : String(err)
    setFetchError(errorMsg)
    if (errorMsg.includes("fetch")) {
      toast.error("Server bilan aloqa qilishda xatolik", {
        description: "Iltimos, internet ulanishini tekshiring yoki sahifani yangilang",
      })
    } else {
      toast.error("AI bilan aloqa qilishda xatolik yuz berdi")
    }
  }, [])

  const {
    messages,
    setMessages,
    status,
    error,
    sendMessage,
    regenerate,
  } = useChat({
    onFinish: handleFinish,
    onError: handleError,
  })

  const isModeLocked = messages.length > 0

  const isLoading = status === "submitted" || status === "streaming"

  // ── Auto-unlock IRAC steps when AI includes [UNLOCK] ──
  useEffect(() => {
    if (isLoading) return
    if (messages.length === 0) return

    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role !== "assistant") return
    if (lastMessage.id === lastUnlockedMsgId.current) return

    const text = getMessageText(lastMessage)
    if (text.includes("[UNLOCK]") || text.includes("[SUCCESS]")) {
      lastUnlockedMsgId.current = lastMessage.id

      setActiveIracStep((current) => {
        const order: IracStep[] = ["issue", "rule", "application", "conclusion"]
        const currentIndex = order.indexOf(current)
        if (currentIndex !== -1 && currentIndex < order.length - 1) {
          const nextStep = order[currentIndex + 1]
          toast.success("Muvaffaqiyatli! Keyingi bosqich ochildi.", { icon: '🔓' })
          return nextStep
        }
        return current
      })
    }
  }, [messages, isLoading])

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Xatolik yuz berdi", {
        description: "Iltimos, keyinroq qayta urinib ko'ring",
      })
    }
  }, [error])

  useEffect(() => {
    if (!currentUser) return
    const unsubscribe = subscribeToUserChats(currentUser.uid, (chats) => {
      setChatHistory(chats)
      if (!hasInitializedSession.current && !activeSessionIdRef.current && chats.length > 0) {
        hasInitializedSession.current = true
        setActiveSessionId(chats[0].id)
        setMessages(toUIMessages(chats[0].messages))
        if (chats[0].mode === "personal" || chats[0].mode === "professor" || chats[0].mode === "caseAnalyzer") {
          setChatMode(chats[0].mode)
        }
      }
    })
    return () => unsubscribe()
  }, [currentUser, setMessages])

  const lastSavedMessageId = useRef<string | null>(null)

  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (activeSessionId && messages.length > 0 && lastMessage?.role === "user") {
      if (lastMessage.id !== lastSavedMessageId.current) {
        lastSavedMessageId.current = lastMessage.id
        updateChatMessages(activeSessionId, messages as unknown as any[])
      }
    }
  }, [messages, activeSessionId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    }
  }, [messages, isLoading])

  useEffect(() => {
    resizeTextarea()
  }, [resizeTextarea])

  const handleCreateNewChat = async () => {
    if (!currentUser) {
      toast.error("Avtorizatsiya talab qilinadi")
      return
    }
    try {
      const newId = await createChatSession(currentUser.uid, "Yangi suhbat", chatMode)
      setActiveSessionId(newId)
      setMessages([])
      setTimeout(() => setInput(""), 10)
      hasInitializedSession.current = true
      toast.success("Yangi suhbat yaratildi")
    } catch (error) {
      console.error("Error creating chat:", error)
      toast.error("Yangi suhbat yaratishda xato")
    }
  }

  const loadChat = useCallback(
    (chat: ChatSession) => {
      setActiveSessionId(chat.id)
      setMessages(toUIMessages(chat.messages))
      if (chat.mode === "personal" || chat.mode === "professor" || chat.mode === "caseAnalyzer") {
        setChatMode(chat.mode)
      }
      hasInitializedSession.current = true
    },
    [setMessages]
  )

  const handleModeChange = useCallback(async (value: string) => {
    const nextMode = value as ChatMode
    if (isModeLocked) return
    setChatMode(nextMode)

    if (activeSessionId) {
      try {
        await updateChatMode(activeSessionId, nextMode)
      } catch (err) {
        console.error("[couch] Failed to persist mode:", err)
      }
    }
  }, [activeSessionId, isModeLocked])

  // Memoize chatBody so the reference only changes when the actual values change.
  // This prevents accidentally passing new object references to sendMessage on
  // every render, which could trigger extra renders in consuming components.
  const chatBody = useMemo(() => ({
    topicId: selectedTopic,
    mode: chatMode,
    responseLength: "default",
    userId: currentUser?.uid ?? null,
  }), [selectedTopic, chatMode, currentUser?.uid])

  const handleEvaluateStep = useCallback(async (step: IracStep) => {
    if (!caseText.trim() || isLoading || isCheckingStep) return false

    try {
      setIsCheckingStep(true)

      const response = await fetch("/api/chat/hint-ladder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseText,
          step,
          studentDraft: iracDraft[step],
        }),
      })

      if (!response.ok) {
        throw new Error(`Judge request failed: ${response.status}`)
      }

      const data = await response.json() as {
        score: "A" | "B" | "C"
        is_correct: boolean
        feedback_to_student: string
        hint_ladder: {
          level_1_strategic: string
          level_2_reconfigure: string
          level_3_heuristic: string
        }
      }

      setHintLadders((prev) => ({
        ...prev,
        [step]: {
          feedback: data.feedback_to_student,
          score: data.score,
          isCorrect: data.is_correct,
          levels: [
            data.hint_ladder.level_1_strategic,
            data.hint_ladder.level_2_reconfigure,
            data.hint_ladder.level_3_heuristic,
          ],
          revealedLevel: prev[step]?.revealedLevel ?? 0,
        },
      }))

      if (data.is_correct) {
        toast.success("Bosqich muvaffaqiyatli tekshirildi")
        return true
      }

      toast.warning("Javob to'liq emas", {
        description: "Feedback ko'rsatildi. Endi xohlasangiz Hint Ladder’dan foydalanishingiz mumkin.",
      })
      return false
    } catch (error) {
      console.error("Step evaluation error:", error)
      toast.error("Bosqichni tekshirishda xatolik yuz berdi")
      return false
    } finally {
      setIsCheckingStep(false)
    }
  }, [caseText, iracDraft, isCheckingStep, isLoading])

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const text = input.trim()
    setInput("")
    try {
      if (!activeSessionId && currentUser) {
        const id = await createChatSession(
          currentUser.uid,
          text.substring(0, 30) || "Yangi suhbat",
          chatMode
        )
        setActiveSessionId(id)
        await sendMessage({ text }, { body: chatBody })
      } else if (activeSessionId && messages.length === 0 && text) {
        await updateChatMessages(activeSessionId, [], text.substring(0, 30))
        await sendMessage({ text }, { body: chatBody })
      } else {
        await sendMessage({ text }, { body: chatBody })
      }
    } catch (err) {
      console.error("Form submit error:", err)
      toast.error("Server bilan aloqa qilishda xatolik", {
        description: "Iltimos, internet ulanishini tekshiring va qayta urinib ko'ring",
      })
    }
  }

  const handleRequestHint = useCallback(async (step: IracStep) => {
    if (!caseText.trim() || isLoading || isHintLoading) return

    const stepLabelMap: Record<IracStep, string> = {
      issue: "Issue",
      rule: "Rule",
      application: "Application",
      conclusion: "Conclusion",
    }

    const currentDraft = iracDraft[step]?.trim() || "Hali yozilmagan"
    const existingLadder = hintLadders[step]
    const nextLevel = existingLadder ? existingLadder.revealedLevel + 1 : 1

    if (nextLevel > 3) {
      toast.message("Bu bosqich uchun barcha ishoralar allaqachon ochilgan")
      return
    }

    try {
      setIsHintLoading(true)

      const ladder = existingLadder
      if (!ladder || ladder.isCorrect) {
        toast.message("Avval Tekshirish orqali bosqichni baholang")
        return
      }

      const updatedLadder: HintLadder = {
        ...ladder,
        revealedLevel: nextLevel as 1 | 2 | 3,
      }

      setHintLadders((prev) => ({
        ...prev,
        [step]: updatedLadder,
      }))

      const currentHint = updatedLadder.levels[nextLevel - 1]
      const xpCost = HINT_COSTS[nextLevel - 1]
      const assistantText = [
        `**${stepLabelMap[step]} bosqichi uchun ishora ${nextLevel}/3**`,
        "",
        updatedLadder.feedback,
        "",
        `**Ishora:** ${currentHint}`,
        "",
        `**XP narxi:** -${xpCost}`,
      ].join("\n")

      const assistantMessage: UIMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        parts: [{ type: "text", text: assistantText }],
      }

      const nextMessages = [...messages, assistantMessage]

      let targetChatId = activeSessionId
      if (!targetChatId && currentUser) {
        targetChatId = await createChatSession(currentUser.uid, `${stepLabelMap[step]} uchun ishora`, chatMode)
        setActiveSessionId(targetChatId)
      }

      setMessages(nextMessages)

      if (targetChatId) {
        await updateChatMessages(targetChatId, nextMessages as unknown as any[])
      }

      setHintCostSpent((prev) => prev + xpCost)
      toast.warning("Ishora ochildi", {
        description: `Yakuniy balldan ${xpCost} XP chegirildi.`,
      })
    } catch (error) {
      console.error("Hint request error:", error)
      toast.error("Ishora yuborishda xatolik yuz berdi")
    } finally {
      setIsHintLoading(false)
    }
  }, [activeSessionId, caseText, chatMode, currentUser, hintLadders, iracDraft, isHintLoading, isLoading, messages, setMessages])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (!isLoading && input.trim()) {
        formRef.current?.requestSubmit()
      }
    }
  }

  if (!isClient) {
    return (
      <div className="flex h-[calc(100dvh-52px-env(safe-area-inset-bottom))] md:h-dvh items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100dvh-52px-env(safe-area-inset-bottom))] md:h-dvh bg-white dark:bg-[#131314]">

      {/* в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
          PERSISTENT HISTORY SIDEBAR (desktop)
          Hidden on mobile вЂ” full screen chat takes over
      в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ */}
      {!isCaseAnalyzerMode && (
      <aside className="hidden md:flex shrink-0 w-60 lg:w-64 flex-col border-r border-slate-200 dark:border-[#2a2c2e] bg-slate-50/60 dark:bg-[#1a1b1c]">
        {/* Sidebar header */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 via-violet-500 to-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 tracking-tight">
              AI Murabbiy
            </span>
          </div>
          <button
            onClick={handleCreateNewChat}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-white dark:bg-[#252628] border border-slate-200 dark:border-[#3a3c3e] text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-blue-500 shrink-0" />
            Yangi suhbat
          </button>
        </div>

        <div className="px-3 pb-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600 px-1">
            Suhbatlar
          </p>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <MessageCircle className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs text-slate-400 dark:text-slate-600">Suhbatlar yo&apos;q</p>
            </div>
          ) : (
            chatHistory.map((chat) => (
              <div
                key={chat.id}
                onClick={() => loadChat(chat)}
                className={cn(
                  "group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all",
                  activeSessionId === chat.id
                    ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
                    : "hover:bg-white dark:hover:bg-[#252628] text-slate-700 dark:text-slate-300"
                )}
              >
                <MessageCircle className="w-3.5 h-3.5 shrink-0 opacity-50" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] leading-snug truncate">{chat.title}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-0.5">
                    {chat.messages.length} xabar
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteChatSession(chat.id)
                    if (activeSessionId === chat.id) {
                      setActiveSessionId(null)
                      setMessages([])
                    }
                  }}
                  className="shrink-0 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>
      )}

      {/* в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
          MAIN CHAT AREA
      в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* в”Ђв”Ђ Top Bar в”Ђв”Ђ */}
        <header className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200/60 dark:border-[#2a2c2e] bg-white dark:bg-[#131314]">
          <div className="flex items-center gap-2">
            {/* Mobile-only: new chat button */}
            <button
              onClick={handleCreateNewChat}
              className={cn(
                "p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-[#2a2f3a] transition-colors",
                !isCaseAnalyzerMode && "md:hidden"
              )}
            >
              <PlusCircle className="w-4 h-4" />
            </button>
            <span className="text-[14px] font-medium text-slate-600 dark:text-slate-400 hidden sm:block">
              {chatHistory.find(c => c.id === activeSessionId)?.title ?? "Yangi suhbat"}
            </span>
          </div>

          <div className="w-8" />
        </header>

        {chatMode === "caseAnalyzer" ? (
          <div className="grid h-[calc(100vh-100px)] grid-cols-1 gap-6 px-4 py-4 sm:px-6 lg:grid-cols-12">
            <aside className="min-h-0 lg:sticky lg:top-6 lg:col-span-5 lg:self-start">
              <div className="flex h-[calc(100vh-148px)] min-h-0 flex-col overflow-hidden rounded-3xl bg-white dark:bg-slate-950">
                <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
                  <div className="mx-auto max-w-[700px] px-4 py-3">
                  {messages.length === 0 ? (
                    <WelcomeState
                      onSuggestionClick={(text) => { setInput(text); textareaRef.current?.focus() }}
                      chatMode={chatMode}
                    />
                  ) : (
                    <div className="pb-4">
                      <div className="flex items-center justify-center mb-8">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#2a2f3a]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-400 dark:text-slate-500">Bugun</span>
                        </div>
                      </div>

                      {messages.map((msg) => (
                        <NotebookMessage key={msg.id} message={msg} />
                      ))}

                      {isLoading && messages[messages.length - 1]?.role === "user" && <TypingIndicator />}

                      {error && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-start gap-3 p-4 mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40"
                        >
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm">{error.message || "Xatolik yuz berdi"}</p>
                            <button onClick={() => regenerate()} className="text-xs underline mt-1 opacity-80">
                              Qayta urinish
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                  </div>
                </div>

                <div className="shrink-0 border-t border-slate-200 px-4 pb-4 pt-3 dark:border-slate-800">
                  <form ref={formRef} onSubmit={handleFormSubmit}>
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 focus-within:border-slate-300 dark:border-slate-800 dark:bg-slate-950">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={isLoading ? "Javob kutilmoqda..." : "Sokratik savol yoki javobingizni yozing..."}
                      disabled={isLoading}
                      rows={1}
                      className={cn(
                        "min-h-[40px] max-h-[140px] w-full resize-none bg-transparent px-3 pt-2.5 pb-1.5",
                        "text-[14px] text-slate-800 placeholder:text-slate-400",
                        "focus:outline-none disabled:opacity-60"
                      )}
                    />

                    <div className="flex items-center justify-between px-2 pb-2">
                      <Select
                        value={selectedTopic}
                        onValueChange={setSelectedTopic}
                        disabled={isContextLoading || isLoading}
                      >
                        <SelectTrigger
                          className={cn(
                            "h-8 gap-1.5 px-3 rounded-full w-auto min-w-[130px]",
                            "border-slate-200 bg-slate-50",
                            "text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
                            "focus:ring-0 shadow-none",
                            "[&>svg]:w-3 [&>svg]:h-3 [&>svg]:opacity-50"
                          )}
                        >
                          <BookOpen className="w-3 h-3 text-blue-500 shrink-0" />
                          <SelectValue placeholder="Kontekst" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[280px] rounded-xl border-slate-200 dark:border-slate-800">
                          <SelectItem value="general" className="text-sm">
                            Umumiy suhbat
                          </SelectItem>
                          {contextGroups.map((group) => (
                            <SelectGroup key={group.id}>
                              <SelectLabel className="text-blue-500 font-semibold text-xs">
                                {group.label}
                              </SelectLabel>
                              {group.topics.map((topic) => (
                                <SelectItem key={topic.id} value={topic.id} className="pl-6 text-sm">
                                  {topic.title}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-2">
                        {isModeLocked ? (
                          <div className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-300">
                            <Lock className="w-3 h-3" />
                            {getModeLabel(chatMode)}
                          </div>
                        ) : (
                          <Select
                            value={chatMode}
                            onValueChange={handleModeChange}
                            disabled={isLoading}
                          >
                            <SelectTrigger
                              className={cn(
                                "h-8 gap-1.5 px-3 rounded-full w-auto min-w-[170px]",
                                "border-slate-200 bg-slate-50",
                                "text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
                                "focus:ring-0 shadow-none",
                                "[&>svg]:w-3 [&>svg]:h-3 [&>svg]:opacity-50"
                              )}
                            >
                              <SelectValue placeholder="Chat rejimi" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                              <SelectItem value="personal" className="text-sm">Shaxsiy yordamchi</SelectItem>
                              <SelectItem value="professor" className="text-sm">Professor</SelectItem>
                              <SelectItem value="caseAnalyzer" className="text-sm">Kazus Tahlilchi</SelectItem>
                            </SelectContent>
                          </Select>
                        )}

                        <button
                          type="submit"
                          disabled={!input.trim() || isLoading}
                          className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                            input.trim() && !isLoading
                              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                              : "text-slate-300 dark:text-slate-700 cursor-not-allowed"
                          )}
                        >
                          {isLoading ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  </form>
                </div>
              </div>
            </aside>

            <main className="min-h-0 lg:col-span-7">
              <CaseWorkspace
                activeIracStep={activeIracStep}
                setActiveIracStep={setActiveIracStep}
                iracDraft={iracDraft}
                setIracDraft={setIracDraft}
                caseText={caseText}
                setCaseText={setCaseText}
                isCaseLocked={isCaseLocked}
                setIsCaseLocked={setIsCaseLocked}
                onEvaluateStep={handleEvaluateStep}
                onRequestHint={handleRequestHint}
                isCheckingStep={isCheckingStep}
                isHintLoading={isHintLoading}
                hintLadders={hintLadders}
                onSubmitToChat={(msg) => sendMessage({ text: msg.content }, { body: chatBody })}
                isChatLoading={isLoading}
              />
            </main>
          </div>
        ) : (
          <>
            {/* в”Ђв”Ђ Messages Area в”Ђв”Ђ */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              <div className="max-w-[700px] mx-auto px-4 sm:px-8 py-6">
                {messages.length === 0 ? (
                  <WelcomeState
                    onSuggestionClick={(text) => { setInput(text); textareaRef.current?.focus() }}
                    chatMode={chatMode}
                  />
                ) : (
                  <div className="pb-6">
                    <div className="flex items-center justify-center mb-8">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#2a2f3a]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-400 dark:text-slate-500">Bugun</span>
                      </div>
                    </div>

                    {messages.map((msg) => (
                      <NotebookMessage key={msg.id} message={msg} />
                    ))}

                    {isLoading && messages[messages.length - 1]?.role === "user" && <TypingIndicator />}

                    {error && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-start gap-3 p-4 mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm">{error.message || "Xatolik yuz berdi"}</p>
                          <button onClick={() => regenerate()} className="text-xs underline mt-1 opacity-80">
                            Qayta urinish
                          </button>
                        </div>
                      </motion.div>
                    )}
                    <div className="h-6" />
                  </div>
                )}
              </div>
            </div>

            {/* в”Ђв”Ђ Input Area в”Ђв”Ђ */}
            <div className="shrink-0 px-4 sm:px-6 pb-5 sm:pb-6 pt-2 bg-white dark:bg-[#131314]">
              <div className="max-w-[700px] mx-auto">
                <form ref={formRef} onSubmit={handleFormSubmit}>
                  <div
                    className={cn(
                      "rounded-2xl border transition-all duration-200",
                      "bg-white dark:bg-[#1e1f20]",
                      "border-slate-200 dark:border-[#3c4043]",
                      "shadow-[0_2px_12px_rgba(0,0,0,0.07)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)]",
                      "focus-within:shadow-[0_4px_20px_rgba(0,0,0,0.11)] dark:focus-within:shadow-[0_4px_20px_rgba(0,0,0,0.4)]",
                      "focus-within:border-slate-300 dark:focus-within:border-[#5c6168]"
                    )}
                  >
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={isLoading ? "Javob kutilmoqda..." : "Savolingizni bu yerga yozing..."}
                      disabled={isLoading}
                      rows={1}
                      className={cn(
                        "w-full px-4 pt-3.5 pb-2 resize-none bg-transparent",
                        "text-[15px] text-slate-800 dark:text-slate-200",
                        "placeholder:text-slate-400 dark:placeholder:text-slate-600",
                        "focus:outline-none disabled:opacity-60",
                        "min-h-[52px] max-h-[200px]"
                      )}
                    />

                    <div className="flex items-center justify-between px-3 pb-3">
                      <Select
                        value={selectedTopic}
                        onValueChange={setSelectedTopic}
                        disabled={isContextLoading || isLoading}
                      >
                        <SelectTrigger
                          className={cn(
                            "h-8 gap-1.5 px-3 rounded-full w-auto min-w-[130px]",
                            "border-slate-200 dark:border-[#3c4043]",
                            "bg-slate-50 dark:bg-[#2a2f3a]",
                            "text-xs font-medium text-slate-600 dark:text-slate-400",
                            "hover:bg-slate-100 dark:hover:bg-[#35373b]",
                            "focus:ring-0 shadow-none",
                            "[&>svg]:w-3 [&>svg]:h-3 [&>svg]:opacity-50"
                          )}
                        >
                          <BookOpen className="w-3 h-3 text-blue-500 shrink-0" />
                          <SelectValue placeholder="Kontekst" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[280px] rounded-xl border-slate-200 dark:border-[#3c4043]">
                          <SelectItem value="general" className="text-sm">
                            Umumiy suhbat
                          </SelectItem>
                          {contextGroups.map((group) => (
                            <SelectGroup key={group.id}>
                              <SelectLabel className="text-blue-500 font-semibold text-xs">
                                {group.label}
                              </SelectLabel>
                              {group.topics.map((topic) => (
                                <SelectItem key={topic.id} value={topic.id} className="pl-6 text-sm">
                                  {topic.title}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-2">
                        {isModeLocked ? (
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                            <Lock className="w-3 h-3" />
                            {getModeLabel(chatMode)}
                          </div>
                        ) : (
                          <Select
                            value={chatMode}
                            onValueChange={handleModeChange}
                            disabled={isLoading}
                          >
                            <SelectTrigger
                              className={cn(
                                "h-8 gap-1.5 px-3 rounded-full w-auto min-w-[170px]",
                                "border-slate-200 dark:border-[#3c4043]",
                                "bg-slate-50 dark:bg-[#2a2f3a]",
                                "text-xs font-medium text-slate-600 dark:text-slate-400",
                                "hover:bg-slate-100 dark:hover:bg-[#35373b]",
                                "focus:ring-0 shadow-none",
                                "[&>svg]:w-3 [&>svg]:h-3 [&>svg]:opacity-50"
                              )}
                            >
                              <SelectValue placeholder="Chat rejimi" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 dark:border-[#3c4043]">
                              <SelectItem value="personal" className="text-sm">Shaxsiy yordamchi</SelectItem>
                              <SelectItem value="professor" className="text-sm">Professor</SelectItem>
                              <SelectItem value="caseAnalyzer" className="text-sm">Kazus Tahlilchi</SelectItem>
                            </SelectContent>
                          </Select>
                        )}

                        <button
                          type="submit"
                          disabled={!input.trim() || isLoading}
                          className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                            input.trim() && !isLoading
                              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                              : "text-slate-300 dark:text-slate-700 cursor-not-allowed"
                          )}
                        >
                          {isLoading ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 mt-2.5">
                  AI ba&apos;zan xato qilishi mumkin. Muhim qarorlar qabul qilishda ma&apos;lumotni tekshiring.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  )
}
