"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, Send, Bot, User, History, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/* ------------------------------------------------------------------ */
/* Types & Mock Data                                                   */
/* ------------------------------------------------------------------ */
interface Message {
  id: string
  role: "user" | "ai"
  text: string
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "ai",
    text: "Assalomu alaykum! Men sizning AI murabbiyingizman. First Principles usulida har qanday huquqiy mavzuni birga tahlil qilamiz. Savolingizni bering.",
  },
  {
    id: "2",
    role: "user",
    text: "Jinoyatning subyektiv tomonini tushuntirib bering.",
  },
  {
    id: "3",
    role: "ai",
    text: "Albatta. Keling, avval \"Qasd\" tushunchasidan boshlaymiz. Sizningcha, to'g'ridan-to'g'ri qasd nima?",
  },
  {
    id: "4",
    role: "user",
    text: "To'g'ridan-to'g'ri qasd — bu odam jinoyat qilayotganini bilishi va xohlashi.",
  },
  {
    id: "5",
    role: "ai",
    text: "Yaxshi boshlang'ich javob! Lekin keling, aniqroq qilaylik. \"Bilishi\" va \"xohlashi\" — bu ikki mustaqil element. Qonunda bu qanday ifodalanadi? O'zbekiston Jinoyat kodeksining 21-moddasiga qarang. U yerda qasdning ta'rifi qanday berilgan?",
  },
]

const chatHistory = [
  { id: "h1", title: "Jinoyatning subyektiv tomonlari", date: "Bugun, 14:30", messageCount: 12 },
  { id: "h2", title: "Fuqarolik shartnomasi: asoslar", date: "Kecha, 18:45", messageCount: 8 },
  { id: "h3", title: "Mehnat huquqi muammolari", date: "3 kun oldin", messageCount: 15 },
  { id: "h4", title: "Konstitutsiya printsiplari", date: "1 hafta oldin", messageCount: 10 },
  { id: "h5", title: "Administrativ javobgarlik", date: "2 hafta oldin", messageCount: 7 },
]

/* ------------------------------------------------------------------ */
/* Chat Bubble Component                                               */
/* ------------------------------------------------------------------ */
function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex gap-2 sm:gap-2.5 max-w-[90%] sm:max-w-[80%] md:max-w-[70%]", isUser ? "ml-auto" : "mr-auto")}>
      {/* Avatar (AI only, shown on the left) */}
      {!isUser && (
        <div className="flex items-start pt-0.5 shrink-0">
          <div className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-slate-100 border border-slate-200">
            <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500" />
          </div>
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          "px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-teal-600 text-white rounded-2xl rounded-br-md"
            : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-md"
        )}
      >
        {message.text}
      </div>

      {/* Avatar (User only, shown on the right) */}
      {isUser && (
        <div className="flex items-start pt-0.5 shrink-0">
          <div className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-teal-700">
            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Couch Page                                                          */
/* ------------------------------------------------------------------ */
export default function CouchPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /* Auto-scroll to bottom on new messages */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  function handleSend() {
    const text = input.trim()
    if (!text) return

    const userMsg: Message = {
      id: String(Date.now()),
      role: "user",
      text,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")

    /* Mock AI response after a short delay */
    setTimeout(() => {
      const aiMsg: Message = {
        id: String(Date.now() + 1),
        role: "ai",
        text: "Ajoyib savol! Keling, buni bosqichma-bosqich tahlil qilaylik. Avvalo, asosiy tushunchani aniqlashimiz kerak — siz qanday ta'rif bergan bo'lar edingiz?",
      }
      setMessages((prev) => [...prev, aiMsg])
    }, 1200)

    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
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
        className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-8"
      >
        <div className="flex flex-col gap-4 max-w-3xl mx-auto">
          {/* Conversation start indicator */}
          <div className="flex items-center justify-center mb-4">
            <span className="text-xs text-slate-300 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              Suhbat boshlanishi
            </span>
          </div>

          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="shrink-0 border-t border-slate-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3 md:px-8 md:py-4">
        <div className="flex items-center gap-2 sm:gap-3 max-w-3xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Savolingizni yozing..."
            className="flex-1 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:border-teal-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-200"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim()}
            className={cn(
              "flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl transition-all duration-200 shrink-0",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2",
              input.trim()
                ? "bg-teal-700 text-white hover:bg-teal-800 active:scale-95"
                : "bg-slate-100 text-slate-300 cursor-not-allowed"
            )}
            aria-label="Yuborish"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
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
          <div className="space-y-2">
            {chatHistory.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setIsHistoryOpen(false)}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-teal-200 transition-all duration-200 group"
              >
                <h3 className="text-sm font-medium text-slate-800 group-hover:text-teal-700 line-clamp-2 mb-1">
                  {chat.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{chat.date}</span>
                  <span>{chat.messageCount} xabar</span>
                </div>
              </button>
            ))}
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
