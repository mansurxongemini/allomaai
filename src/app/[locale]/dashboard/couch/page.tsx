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
  Settings2,
  X,
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
  deleteChatSession
} from "@/lib/firebase/chats"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { useChatContextOptions } from "@/hooks/useChatContextOptions"
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
type ResponseLength = "default" | "longer" | "shorter"

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
/* Configure Chat Modal                                                */
/* ------------------------------------------------------------------ */
interface ConfigureModalProps {
  open: boolean
  onClose: () => void
  roleMode: RoleMode
  onRoleChange: (r: RoleMode) => void
  customInstructions: string
  onInstructionsChange: (v: string) => void
  responseLength: ResponseLength
  onLengthChange: (l: ResponseLength) => void
  onSave: () => void
}

function ConfigureChatModal({
  open,
  onClose,
  roleMode,
  onRoleChange,
  customInstructions,
  onInstructionsChange,
  responseLength,
  onLengthChange,
  onSave,
}: ConfigureModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", damping: 32, stiffness: 380 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-[520px] mx-auto bg-white dark:bg-[#1e1f20] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#3c4043] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-5">
              <h2 className="text-[17px] font-semibold text-slate-900 dark:text-slate-100">
                Configure Chat
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-700" />

            {/* Body */}
            <div className="px-6 py-5 space-y-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Notebooks can be customized to help you achieve different goals: do research, help
                learn, show various perspectives, or converse in a particular style and tone.
              </p>

              {/* Role Selection */}
              <div>
                <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Define your conversational goal, style, or role
                </p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { key: "default", label: "Default" },
                      { key: "learning", label: "Learning Guide" },
                      { key: "professor", label: "Strict Professor" },
                      { key: "friend", label: "Empathetic Friend" },
                      { key: "custom", label: "Custom" },
                    ] as { key: RoleMode; label: string }[]
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => onRoleChange(key)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                        roleMode === key
                          ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                          : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {/* Persona description */}
                {roleMode === "professor" && (
                  <p className="mt-2 text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    🎓 <strong>Qat'iy Professor</strong> — Rasmiy akademik uslub. Huquqiy tushunchalarni ta'rif → element → qonuniy asos → kazus formatida tushuntiradi va nazorat savollari beradi.
                  </p>
                )}
                {roleMode === "friend" && (
                  <p className="mt-2 text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    🤝 <strong>Empatik Do'st</strong> — Iliq va qo'llab-quvvatlovchi uslub. Murakkab huquqiy tushunchalarni oddiy hayotiy misollar orqali tushuntiradi va rag'batlantiradi.
                  </p>
                )}
              </div>

              {/* Custom Instructions Textarea */}
              <div className="relative">
                <textarea
                  value={customInstructions}
                  onChange={(e) => onInstructionsChange(e.target.value.slice(0, 10000))}
                  placeholder={
                    roleMode === "custom"
                      ? "Describe how you'd like the AI to respond, what role it should play, or any specific instructions..."
                      : "Select 'Custom' to add your own instructions"
                  }
                  rows={5}
                  disabled={roleMode !== "custom"}
                  className={cn(
                    "w-full resize-none rounded-xl border px-4 py-3 pb-7",
                    "text-sm leading-relaxed focus:outline-none transition-all",
                    roleMode === "custom"
                      ? "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#2a2f3a] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:focus:border-blue-500"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#252729] text-slate-400 dark:text-slate-600 cursor-not-allowed"
                  )}
                />
                <span className="absolute bottom-2.5 right-3 text-[11px] text-slate-400 dark:text-slate-600 select-none">
                  {customInstructions.length} / 10000
                </span>
              </div>

              {/* Response Length */}
              <div>
                <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Choose your response length
                </p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { key: "default", label: "Default" },
                      { key: "longer", label: "Longer" },
                      { key: "shorter", label: "Shorter" },
                    ] as { key: ResponseLength; label: string }[]
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => onLengthChange(key)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                        responseLength === key
                          ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                          : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-700" />

            {/* Footer */}
            <div className="flex justify-end px-6 py-4">
              <button
                onClick={onSave}
                className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-full transition-colors shadow-sm"
              >
                Save
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
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

function NotebookMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === "user"
  const text = getMessageText(message)

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end mb-6"
      >
        <div className="max-w-[78%] px-4 py-3 rounded-2xl bg-slate-100 dark:bg-[#2a2f3a] text-slate-800 dark:text-slate-200 text-[15px] leading-relaxed whitespace-pre-wrap">
          {text}
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
          {mainText.trim()}
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
  roleMode,
}: {
  onSuggestionClick: (text: string) => void
  roleMode: RoleMode
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
        {roleMode === "learning"
          ? "O'qishni boshlaylik!"
          : roleMode === "professor"
          ? "Darsni boshlaylik!"
          : roleMode === "friend"
          ? "Salom, do'stim! 👋"
          : roleMode === "custom"
          ? "Sozlangan AI Murabbiy"
          : "Assalomu alaykum!"}
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-base mb-10">
        {roleMode === "professor"
          ? "Huquqiy savolingizni aniq va to'liq yozing"
          : roleMode === "friend"
          ? "Hech qanday savol ahmoqona emas — so'rang!"
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
  const { groups: contextGroups, isLoading: isContextLoading } = useChatContextOptions()

  // Configure Chat вЂ” draft state (not applied until saved)
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [draftRole, setDraftRole] = useState<RoleMode>("default")
  const [draftInstructions, setDraftInstructions] = useState("")
  const [draftLength, setDraftLength] = useState<ResponseLength>("default")

  // Applied config (actually sent to API)
  const [appliedRole, setAppliedRole] = useState<RoleMode>("default")
  const [appliedInstructions, setAppliedInstructions] = useState("")
  const [appliedLength, setAppliedLength] = useState<ResponseLength>("default")

  // Stable refs so that useChat callback identity doesn't change on every render
  const activeSessionIdRef = useRef<string | null>(null)
  const currentUserRef = useRef(currentUser)

  useEffect(() => { activeSessionIdRef.current = activeSessionId }, [activeSessionId])
  useEffect(() => { currentUserRef.current = currentUser }, [currentUser])

  const [fetchError, setFetchError] = useState<string | null>(null)
  const [input, setInput] = useState("")

  useEffect(() => { setIsClient(true) }, [])

  // Memoize callbacks so that useChat does not see a new options object on
  // every render, which could trigger unnecessary internal re-initializations.
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

  const isLoading = status === "submitted" || status === "streaming"

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
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleCreateNewChat = async () => {
    if (!currentUser) {
      toast.error("Avtorizatsiya talab qilinadi")
      return
    }
    try {
      const newId = await createChatSession(currentUser.uid, "Yangi suhbat")
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
      hasInitializedSession.current = true
    },
    [setMessages]
  )

  const openConfig = () => {
    setDraftRole(appliedRole)
    setDraftInstructions(appliedInstructions)
    setDraftLength(appliedLength)
    setIsConfigOpen(true)
  }

  const handleSaveConfig = () => {
    setAppliedRole(draftRole)
    setAppliedInstructions(draftInstructions)
    setAppliedLength(draftLength)
    setIsConfigOpen(false)
    toast.success("Chat sozlamalari saqlandi")
  }

  // Memoize chatBody so the reference only changes when the actual values change.
  // This prevents accidentally passing new object references to sendMessage on
  // every render, which could trigger extra renders in consuming components.
  const chatBody = useMemo(() => ({
    topicId: selectedTopic,
    roleMode: appliedRole,
    systemInstructions: appliedInstructions,
    responseLength: appliedLength,
    userId: currentUser?.uid ?? null,
  }), [selectedTopic, appliedRole, appliedInstructions, appliedLength, currentUser?.uid])

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const text = input.trim()
    setInput("")
    try {
      if (!activeSessionId && currentUser) {
        const id = await createChatSession(
          currentUser.uid,
          text.substring(0, 30) || "Yangi suhbat"
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (!isLoading && input.trim()) {
        formRef.current?.requestSubmit()
      }
    }
  }

  const isConfigured =
    appliedRole !== "default" ||
    appliedInstructions.trim() !== "" ||
    appliedLength !== "default"

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
              className="md:hidden p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-[#2a2f3a] transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
            <span className="text-[14px] font-medium text-slate-600 dark:text-slate-400 hidden sm:block">
              {chatHistory.find(c => c.id === activeSessionId)?.title ?? "Yangi suhbat"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={openConfig}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] transition-colors",
                isConfigured
                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2a2f3a]"
              )}
            >
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">Configure Chat</span>
            </button>
          </div>
        </header>

        {/* в”Ђв”Ђ Applied Config Banner в”Ђв”Ђ */}
        <AnimatePresence>
          {isConfigured && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="shrink-0 overflow-hidden"
            >
              <div className="flex items-center gap-2 px-5 py-1.5 bg-blue-50 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/30">
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {appliedRole === "learning" && "рџ“љ Learning Guide mode"}
                  {appliedRole === "custom" && "вњЏпёЏ Custom instructions active"}
                  {appliedRole === "default" && appliedLength !== "default" && "вљЎ"}
                  {appliedLength !== "default"
                    ? `${appliedRole !== "default" ? " В· " : ""}${appliedLength === "longer" ? "Uzunroq" : "Qisqaroq"} javoblar`
                    : ""}
                </span>
                <button
                  onClick={openConfig}
                  className="ml-auto text-xs text-blue-500 hover:text-blue-700 underline"
                >
                  Edit
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* в”Ђв”Ђ Messages Area в”Ђв”Ђ */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="max-w-[700px] mx-auto px-4 sm:px-8 py-6">
            {messages.length === 0 ? (
              <WelcomeState
                onSuggestionClick={(text) => { setInput(text); textareaRef.current?.focus() }}
                roleMode={appliedRole}
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
                  onChange={(e) => setInput(e.target.value)}
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
            </form>

            <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 mt-2.5">
              AI ba&apos;zan xato qilishi mumkin. Muhim qarorlar qabul qilishda ma&apos;lumotni tekshiring.
            </p>
          </div>
        </div>
      </div>

      {/* в”Ђв”Ђ Configure Chat Modal в”Ђв”Ђ */}
      <ConfigureChatModal
        open={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        roleMode={draftRole}
        onRoleChange={setDraftRole}
        customInstructions={draftInstructions}
        onInstructionsChange={setDraftInstructions}
        responseLength={draftLength}
        onLengthChange={setDraftLength}
        onSave={handleSaveConfig}
      />
    </div>
  )
}
