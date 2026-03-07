"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  MessageCircle,
  Send,
  Bot,
  User,
  History,
  X,
  PlusCircle,
  AlertCircle,
  Sparkles,
  Wand2,
  Lightbulb,
  ChevronRight,
  Trash2,
  Clock,
  Paperclip,
  Mic,
  Zap,
  BookOpen
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useChat } from "@ai-sdk/react"
import type { Message } from "ai"
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
/* Suggestion Chips                                                   */
/* ------------------------------------------------------------------ */
const SUGGESTIONS = [
  { icon: Lightbulb, text: "Mulk huquqi nima?" },
  { icon: Wand2, text: "Shartnoma tuzish qoidalari" },
  { icon: Sparkles, text: "Sud jarayonini tushuntir" },
]

/* ------------------------------------------------------------------ */
/* Chat Bubble Component                                               */
/* ------------------------------------------------------------------ */
function ChatBubble({ message, index, isConsecutive }: { message: Message; index: number; isConsecutive?: boolean }) {
  const isUser = message.role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.2) }}
      className={cn(
        "flex gap-3 sm:gap-4 max-w-[95%] sm:max-w-[90%] md:max-w-[85%]",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto",
        isConsecutive ? "mt-1" : "mt-6"
      )}
    >
      {/* Avatar (AI only - hide if consecutive) */}
      {!isUser && (
        <div className="flex items-start shrink-0 w-9 sm:w-10">
          {!isConsecutive && (
            <div className={cn(
              "flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl",
              "bg-gradient-to-br from-violet-600 to-violet-700",
              "shadow-md shadow-violet-500/20 ring-2 ring-white dark:ring-slate-800"
            )}>
              <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          )}
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          "px-6 py-4 text-[15px] leading-relaxed overflow-x-auto",
          "prose prose-sm max-w-none shadow-sm",
          isUser
            ? "bg-violet-600 text-white rounded-2xl rounded-tr-sm"
            : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-sm"
        )}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap font-medium">{message.content}</div>
        ) : (
          <div className="prose-headings:font-bold prose-a:text-violet-600 dark:prose-a:text-violet-400 prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Avatar (User only - hide if consecutive) */}
      {isUser && (
        <div className="flex items-start shrink-0 w-9 sm:w-10">
          {!isConsecutive && (
            <div className={cn(
              "flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl",
              "bg-gradient-to-br from-teal-500 to-teal-600",
              "shadow-md shadow-teal-500/20 ring-2 ring-white dark:ring-slate-800"
            )}>
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Typing Indicator Component                                          */
/* ------------------------------------------------------------------ */
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 sm:gap-4 max-w-[90%] sm:max-w-[80%] md:max-w-[70%] mr-auto"
    >
      <div className="flex items-start pt-1 shrink-0">
        <div className={cn(
          "flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl",
          "bg-gradient-to-br from-violet-500 to-violet-600",
          "shadow-lg shadow-violet-500/25"
        )}>
          <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </div>
      </div>
      <div className={cn(
        "px-5 py-4 rounded-2xl rounded-bl-md",
        "bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm",
        "border border-slate-200/80 dark:border-slate-700/50",
        "shadow-lg shadow-slate-200/20 dark:shadow-none",
        "flex items-center gap-1.5 h-[52px]"
      )}>
        <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" />
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Error Message Component                                             */
/* ------------------------------------------------------------------ */
function ErrorMessage({ error, onRetry }: { error: Error | undefined; onRetry?: () => void }) {
  if (!error) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex items-start gap-3 max-w-[90%] sm:max-w-[85%] md:max-w-[80%] mx-auto my-4 p-4",
        "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30",
        "rounded-2xl shadow-sm"
      )}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 shrink-0">
        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-red-700 dark:text-red-400">Xatolik yuz berdi</p>
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
          {error.message || "AI javob berishda muammo yuzaga keldi. Qayta urinib ko'ring."}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 text-xs font-semibold text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline underline-offset-2"
          >
            Qayta yuborish
          </button>
        )}
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Empty State Component                                               */
/* ------------------------------------------------------------------ */
function EmptyState({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center text-center py-12 px-4 max-w-3xl mx-auto"
    >
      <div className="w-20 h-20 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-6 shadow-sm">
        <Sparkles className="w-10 h-10 text-violet-600" />
      </div>

      <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
        Assalomu alaykum!
      </h3>
      <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 leading-relaxed">
        Men sizning huquqiy AI yordamchingizman. Qanday savolingiz bor?
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {SUGGESTIONS.map((suggestion, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            onClick={() => onSuggestionClick(suggestion.text)}
            className={cn(
              "flex items-center gap-4 p-5 rounded-2xl text-left",
              "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
              "hover:border-violet-400 dark:hover:border-violet-600 hover:shadow-md transition-all group"
            )}
          >
            <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-900/20 group-hover:bg-violet-100 transition-colors">
              <suggestion.icon className="h-5 w-5 text-violet-600" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {suggestion.text}
            </span>
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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [isClient, setIsClient] = useState(false)
  const hasInitializedSession = useRef(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Context Selection
  const [selectedTopic, setSelectedTopic] = useState<string>("general")
  const { groups: contextGroups, isLoading: isContextLoading } = useChatContextOptions()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const [fetchError, setFetchError] = useState<string | null>(null)

  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setMessages,
    reload
  } = useChat({
    api: "/api/chat",
    body: {
      topicId: selectedTopic
    },
    onFinish: (message) => {
      setFetchError(null)
      if (activeSessionId && currentUser) {
        updateChatMessages(activeSessionId, [...messages, message] as unknown as any[])
      }
    },
    onError: (err) => {
      console.error('Chat error:', err)
      const errorMsg = err instanceof Error ? err.message : String(err)
      setFetchError(errorMsg)
      if (errorMsg.includes('fetch')) {
        toast.error("Server bilan aloqa qilishda xatolik", {
          description: "Iltimos, internet ulanishini tekshiring yoki sahifani yangilang"
        })
      } else {
        toast.error("AI bilan aloqa qilishda xatolik yuz berdi")
      }
    }
  })

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Xatolik yuz berdi", {
        description: "Iltimos, keyinroq qayta urinib ko'ring"
      })
    }
  }, [error])

  useEffect(() => {
    if (!currentUser) return
    const unsubscribe = subscribeToUserChats(currentUser.uid, (chats) => {
      setChatHistory(chats)
      if (!hasInitializedSession.current && !activeSessionId && chats.length > 0) {
        hasInitializedSession.current = true
        setActiveSessionId(chats[0].id)
        setMessages(chats[0].messages as any)
      }
    })
    return () => unsubscribe()
  }, [currentUser])

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
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages, isLoading])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
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
      setIsHistoryOpen(false)
      setTimeout(() => setInput(""), 10)
      hasInitializedSession.current = true
      toast.success("Yangi suhbat yaratildi")
    } catch (error) {
      console.error('Error creating chat:', error)
      toast.error("Yangi suhbat yaratishda xato")
    }
  }

  const loadChat = useCallback((chat: ChatSession) => {
    setActiveSessionId(chat.id)
    setMessages(chat.messages as any)
    setIsHistoryOpen(false)
    hasInitializedSession.current = true
  }, [setMessages])

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    try {
      if (!activeSessionId && currentUser) {
        const id = await createChatSession(currentUser.uid, input.trim().substring(0, 30) || "Yangi suhbat")
        setActiveSessionId(id)
        await handleSubmit(e)
      } else if (activeSessionId && messages.length === 0 && input.trim()) {
        await updateChatMessages(activeSessionId, [], input.trim().substring(0, 30))
        await handleSubmit(e)
      } else {
        await handleSubmit(e)
      }
    } catch (err) {
      console.error('Form submit error:', err)
      toast.error("Server bilan aloqa qilishda xatolik", {
        description: "Iltimos, internet ulanishini tekshiring va qayta urinib ko'ring"
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

  const handleSuggestionClick = (text: string) => {
    setInput(text)
    textareaRef.current?.focus()
  }

  if (!isClient) {
    return (
      <div className="flex flex-col h-[calc(100dvh-52px-env(safe-area-inset-bottom))] md:h-[calc(100dvh-4rem)] items-center justify-center">
        <div className="w-10 h-10 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-52px-env(safe-area-inset-bottom))] md:h-[calc(100dvh-4rem)] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-white to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-violet-950/20 pointer-events-none" />

      {/* Header */}
      <header className="relative shrink-0 px-4 py-4 sm:px-6 sm:py-5 md:px-8 lg:px-10 border-b border-slate-200/50 dark:border-slate-700/30 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center justify-center h-11 w-11 rounded-xl",
              "bg-gradient-to-br from-violet-500 to-violet-600",
              "shadow-lg shadow-violet-500/25"
            )}>
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                AI Murabbiy
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800">
                  <Zap className="h-3 w-3 text-violet-600" />
                  <span className="text-[10px] font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">Model: Flash</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  • First Principles
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Context Selector */}
            <Select value={selectedTopic} onValueChange={setSelectedTopic} disabled={isContextLoading || isLoading}>
              <SelectTrigger className="w-[180px] sm:w-[220px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <BookOpen className="h-4 w-4 text-violet-500" />
                  <SelectValue placeholder="Kontekst tanlash" />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="general" className="font-medium">
                  Umumiy suhbat
                </SelectItem>
                {contextGroups.map((group) => (
                  <SelectGroup key={group.id}>
                    <SelectLabel className="text-violet-600 dark:text-violet-400 font-semibold bg-slate-50 dark:bg-slate-900/50">
                      {group.label}
                    </SelectLabel>
                    {group.topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id} className="pl-6 text-slate-700 dark:text-slate-300">
                        {topic.title}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryOpen(true)}
              className={cn(
                "gap-2 rounded-xl border-slate-200 dark:border-slate-700",
                "hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:border-violet-200 dark:hover:border-violet-800",
                "transition-all duration-200"
              )}
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Tarix</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Messages Area */}
      <div
        ref={scrollRef}
        className="relative flex-1 overflow-y-auto scroll-smooth"
      >
        <div className="flex flex-col gap-6 max-w-5xl mx-auto px-3 py-6 sm:px-4 sm:py-8 md:px-8">
          {messages.length === 0 ? (
            <EmptyState onSuggestionClick={handleSuggestionClick} />
          ) : (
            <>
              {/* Conversation start indicator */}
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Bugun</span>
                </div>
              </div>

              {messages.map((msg, idx) => {
                const isConsecutive = idx > 0 && messages[idx - 1].role === msg.role
                return <ChatBubble key={msg.id} message={msg as any} index={idx} isConsecutive={isConsecutive} />
              })}

              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <TypingIndicator />
              )}

              <ErrorMessage error={error} onRetry={() => reload()} />

              {/* Bottom spacing */}
              <div className="h-4" />
            </>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="relative shrink-0 px-3 py-4 sm:px-4 sm:py-5 md:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/30">
        <div className="max-w-5xl mx-auto">
          <form ref={formRef} onSubmit={handleFormSubmit} className="relative">
            <div className={cn(
              "flex items-end gap-2 sm:gap-3 p-2.5 rounded-2xl",
              "bg-white dark:bg-slate-800",
              "border border-gray-200 dark:border-slate-700 shadow-md",
              "focus-within:border-gray-300 dark:focus-within:border-slate-600",
              "transition-colors duration-200"
            )}>
              <div className="flex items-center self-center pl-1">
                <button type="button" className="p-2 text-slate-400 hover:text-violet-500 transition-colors">
                  <Paperclip className="h-5 w-5" />
                </button>
              </div>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={isLoading ? "Javob kutilmoqda..." : "Savolingizni bu yerga yozing..."}
                disabled={isLoading}
                rows={1}
                className={cn(
                  "flex-1 min-w-0 min-h-[44px] max-h-[200px] resize-none",
                  "bg-transparent px-2 py-3 text-[15px] text-slate-800 dark:text-slate-200",
                  "placeholder:text-slate-400 focus:outline-none disabled:opacity-50",
                  "custom-scrollbar"
                )}
              />
              <div className="flex items-center gap-1.5 self-center pr-1">
                <button type="button" className="p-2 text-slate-400 hover:text-violet-500 transition-colors hidden sm:block">
                  <Mic className="h-5 w-5" />
                </button>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "flex items-center justify-center h-10 w-10 rounded-xl transition-all duration-200 shrink-0",
                    input.trim() && !isLoading
                      ? "bg-violet-600 text-white shadow-md hover:bg-violet-700 hover:scale-105 active:scale-95"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                  )}
                  aria-label="Yuborish"
                >
                  <Send className={cn("h-4.5 w-4.5", isLoading && "animate-pulse")} />
                </button>
              </div>
            </div>
          </form>

          <p className="text-center text-[12px] text-slate-500 dark:text-slate-400 mt-4 leading-relaxed max-w-lg mx-auto">
            AI ba'zan xato qilishi mumkin. Muhim qarorlar qabul qilishda ma'lumotni tekshiring.
          </p>
        </div>
      </div>

      {/* History Drawer */}
      <AnimatePresence>
        {isHistoryOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: -400, opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0.5 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={cn(
                "fixed inset-y-0 left-0 z-50 w-80",
                "bg-white dark:bg-slate-900",
                "border-r border-slate-200 dark:border-slate-700",
                "shadow-2xl"
              )}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/50">
                    <History className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Tarix</h2>
                    <p className="text-xs text-slate-500">{chatHistory.length} suhbat</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsHistoryOpen(false)}
                  className="h-9 w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* History List */}
              <div className="overflow-y-auto h-[calc(100%-80px)] p-4">
                <Button
                  onClick={handleCreateNewChat}
                  className={cn(
                    "w-full justify-start gap-3 mb-4 py-3 rounded-xl",
                    "bg-gradient-to-r from-violet-600 to-violet-500",
                    "text-white shadow-lg shadow-violet-500/25",
                    "hover:shadow-xl hover:shadow-violet-500/30",
                    "transition-all duration-200"
                  )}
                >
                  <PlusCircle className="h-4 w-4" />
                  Yangi suhbat
                </Button>

                <div className="space-y-2">
                  {chatHistory.length === 0 ? (
                    <div className="text-center p-8 text-sm text-slate-500">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <MessageCircle className="h-8 w-8 text-slate-400" />
                      </div>
                      <p>Suhbatlar tarixi bo'sh</p>
                    </div>
                  ) : (
                    chatHistory.map((chat, idx) => (
                      <motion.button
                        key={chat.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => loadChat(chat)}
                        className={cn(
                          "w-full text-left p-4 rounded-xl border transition-all duration-200 group relative",
                          activeSessionId === chat.id
                            ? "border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/30 shadow-sm"
                            : "border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        )}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h3 className={cn(
                            "text-sm font-semibold line-clamp-1 pr-8",
                            activeSessionId === chat.id
                              ? "text-violet-700 dark:text-violet-300"
                              : "text-slate-800 dark:text-slate-200"
                          )}>
                            {chat.title}
                          </h3>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {chat.updatedAt
                              ? new Date(chat.updatedAt?.toDate ? chat.updatedAt.toDate() : chat.updatedAt).toLocaleDateString("uz-UZ", { day: 'numeric', month: 'short' })
                              : ""
                            }
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                            {chat.messages.length} xabar
                          </span>
                        </div>

                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteChatSession(chat.id)
                            if (activeSessionId === chat.id) {
                              setActiveSessionId(null)
                              setMessages([])
                            }
                          }}
                          className="absolute top-3 right-3 p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
