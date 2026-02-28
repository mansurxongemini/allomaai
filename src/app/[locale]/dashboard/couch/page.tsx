"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, Send, Bot, User, History, X, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useChat, type Message } from "@ai-sdk/react"
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

/* ------------------------------------------------------------------ */
/* Chat Bubble Component                                               */
/* ------------------------------------------------------------------ */
function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex gap-2 sm:gap-2.5 max-w-[90%] sm:max-w-[85%] md:max-w-[80%]", isUser ? "ml-auto" : "mr-auto")}>
      {/* Avatar (AI only, shown on the left) */}
      {!isUser && (
        <div className="flex items-start pt-0.5 shrink-0">
          <div className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-teal-100 border border-teal-200">
            <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-700" />
          </div>
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          "px-4 py-3 text-sm leading-relaxed overflow-x-auto",
          isUser
            ? "bg-teal-600 text-white rounded-2xl rounded-br-md"
            : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-md shadow-sm prose prose-sm max-w-none prose-teal prose-headings:font-semibold prose-a:text-teal-600 hover:prose-a:text-teal-700"
        )}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        )}
      </div>

      {/* Avatar (User only, shown on the right) */}
      {isUser && (
        <div className="flex items-start pt-0.5 shrink-0">
          <div className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-teal-700 shadow-sm border border-teal-800">
            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Typing Indicator Component                                          */
/* ------------------------------------------------------------------ */
function TypingIndicator() {
  return (
    <div className="flex gap-2 sm:gap-2.5 max-w-[90%] sm:max-w-[80%] md:max-w-[70%] mr-auto">
      <div className="flex items-start pt-0.5 shrink-0">
        <div className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-teal-100 border border-teal-200">
          <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-700 hidden sm:block delay-100 animate-pulse" />
        </div>
      </div>
      <div className="px-5 py-4 bg-white border border-slate-200 rounded-2xl rounded-bl-md shadow-sm flex items-center gap-1.5 h-[44px]">
        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
      </div>
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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat",
    onFinish: (message) => {
      if (activeSessionId && currentUser) {
        updateChatMessages(activeSessionId, [...messages, message] as unknown as any[])
      }
    }
  })

  /* Listen to user's chat history from Firestore */
  useEffect(() => {
    if (!currentUser) return
    const unsubscribe = subscribeToUserChats(currentUser.uid, (chats) => {
      setChatHistory(chats)

      // If no active session, and we have histories, load the most recent one automatically
      if (!activeSessionId && chats.length > 0) {
        setActiveSessionId(chats[0].id)
        setMessages(chats[0].messages as any)
      }
    })
    return () => unsubscribe()
  }, [currentUser, activeSessionId, setMessages])

  /* Sync messages to Firestore as the user types/sends, except when AI is responding (which is handled in onFinish) */
  useEffect(() => {
    // Only save user messages to DB right away. Wait for AI to finish for assistant messages.
    const lastMessage = messages[messages.length - 1]
    if (activeSessionId && messages.length > 0 && lastMessage?.role === "user") {
      updateChatMessages(activeSessionId, messages as unknown as any[])
    }
  }, [messages, activeSessionId])

  /* Auto-scroll to bottom on new messages or loading state */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleCreateNewChat = async () => {
    if (!currentUser) return
    try {
      const newId = await createChatSession(currentUser.uid, "Yangi suhbat")
      setActiveSessionId(newId)
      setMessages([])
      setIsHistoryOpen(false)
      setTimeout(() => setInput(""), 10) // clear input
    } catch (error) {
      toast.error("Yangi suhbat yaratishda xato")
    }
  }

  const loadChat = (chat: ChatSession) => {
    setActiveSessionId(chat.id)
    setMessages(chat.messages as any)
    setIsHistoryOpen(false)
  }

  const formRef = useRef<HTMLFormElement>(null)

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // If it's the very first message of a completely new user who has never chatted, create session first
    if (!activeSessionId && currentUser) {
      createChatSession(currentUser.uid, input.trim().substring(0, 30) || "Yangi suhbat").then(id => {
        setActiveSessionId(id)
        handleSubmit(e)
      })
    } else if (activeSessionId && messages.length === 0 && input.trim()) {
      // Update the title of the chat based on the first message
      updateChatMessages(activeSessionId, [], input.trim().substring(0, 30))
      handleSubmit(e)
    } else {
      handleSubmit(e)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      formRef.current?.requestSubmit()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-52px-env(safe-area-inset-bottom))] md:h-[100dvh] relative">
      {/* Header */}
      <header className="shrink-0 px-4 py-3 sm:px-6 sm:py-5 md:px-8 lg:px-10 lg:py-6 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-teal-50 border border-teal-200 shrink-0">
              <MessageCircle className="h-4 w-4 text-teal-700" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-800">
                Couch — AI Murabbiy
              </h1>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-500">
                First Principles asosida suhbat
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsHistoryOpen(true)}
            className="gap-2"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Tarix</span>
          </Button>
        </div>
      </header>

      {/* Chat Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-8 scroll-smooth"
      >
        <div className="flex flex-col gap-5 max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-[40vh] text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Qanday yordam bera olaman?</h3>
              <p className="text-sm max-w-sm">
                Huquqiy masalalar, kazuslar yoki nazariyani First Principles yondashuvi bilan tahlil qilishimiz mumkin.
              </p>
            </div>
          ) : (
            <>
              {/* Conversation start indicator */}
              <div className="flex items-center justify-center mb-2">
                <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                  Bugun
                </span>
              </div>

              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg as any} />
              ))}

              {/* Show typing indicator while AI is generating the response */}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <TypingIndicator />
              )}
            </>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="shrink-0 border-t border-slate-200 bg-white px-3 py-3 sm:px-4 sm:py-4 md:px-8 md:py-5">
        <form ref={formRef} onSubmit={handleFormSubmit} className="flex items-end gap-2 sm:gap-3 max-w-3xl mx-auto relative group">
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="AI murabbiyga yozing..."
            className="flex-1 min-w-0 min-h-[52px] max-h-32 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:border-teal-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 custom-scrollbar"
            rows={1}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              "flex items-center justify-center h-[52px] w-[52px] rounded-2xl transition-all duration-200 shrink-0",
              input.trim() && !isLoading
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/20 hover:bg-teal-700 hover:shadow-lg hover:-translate-y-0.5"
                : "bg-slate-100 text-slate-300 cursor-not-allowed"
            )}
            aria-label="Yuborish"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
        <p className="text-center text-[11px] text-slate-400 mt-3 hidden sm:block">
          AI ba'zan xato qilishi mumkin. Muhim qarorlar qabul qilishda ma'lumotni tekshiring.
        </p>
      </div>

      {/* History Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-slate-200 shadow-xl transition-transform duration-300 ease-in-out",
          isHistoryOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-teal-700" />
            <h2 className="text-lg font-semibold text-slate-800">Suhbatlar tarixi</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsHistoryOpen(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* History List */}
        <div className="overflow-y-auto h-[calc(100%-65px)] p-3">
          <Button
            onClick={handleCreateNewChat}
            variant="outline"
            className="w-full justify-start gap-2 mb-4 border-dashed border-teal-300 text-teal-700 hover:text-teal-800 hover:bg-teal-50"
          >
            <PlusCircle className="h-4 w-4" />
            Yangi suhbat
          </Button>

          <div className="space-y-2">
            {chatHistory.length === 0 ? (
              <div className="text-center p-4 text-sm text-slate-500">
                Suhbatlar tarixi bo'sh
              </div>
            ) : (
              chatHistory.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => loadChat(chat)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-all duration-200 group relative",
                    activeSessionId === chat.id
                      ? "border-teal-300 bg-teal-50"
                      : "border-slate-200 hover:bg-slate-50 hover:border-teal-200"
                  )}
                >
                  <h3 className={cn(
                    "text-sm font-medium line-clamp-2 mb-1 pr-6",
                    activeSessionId === chat.id ? "text-teal-800" : "text-slate-800 group-hover:text-teal-700"
                  )}>
                    {chat.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{chat.updatedAt ? new Date(chat.updatedAt?.toDate ? chat.updatedAt.toDate() : chat.updatedAt).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short" }) : ""}</span>
                    <span>{chat.messages.length} xabar</span>
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
                    className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-red-100 text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3.5 w-3.5" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isHistoryOpen && (
        <div
          onClick={() => setIsHistoryOpen(false)}
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
        />
      )}
    </div>
  )
}
