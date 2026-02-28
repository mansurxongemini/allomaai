"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Link, useRouter } from "@/i18n/routing"
import { BookOpen, Upload, CheckCircle2, Sparkles, TrendingUp, BadgeCheck, FileText, CheckCircle, Brain, Plus, AlertCircle, MessageSquare, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import MiniEditor from "@/components/ui/editor/MiniEditor"
import AdvancedEditor from "@/components/ui/editor/AdvancedEditor"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { getTopicDetail } from "@/services/firestore"
import { Topic } from "@/types"
import DOMPurify from "dompurify"
import Image from "next/image"

const MAX_AI_SCORE = 70;
const MAX_PLAGIARISM_SCORE = 50;

export default function TopicPage() {
  const params = useParams()
  const router = useRouter()
  const subjectId = params.id as string
  const topicId = params.topicId as string

  const [topic, setTopic] = useState<Topic | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [answers, setAnswers] = useState({ q1: "", q2: "", q3: "" })
  const [mindMapFile, setMindMapFile] = useState<File | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [score, setScore] = useState(0)
  const [showDraftModal, setShowDraftModal] = useState(false)
  const [draftContent, setDraftContent] = useState("")
  const [isPaid, setIsPaid] = useState(false)
  const [aiScore, setAiScore] = useState(0)
  const [plagiarismScore, setPlagiarismScore] = useState(0)
  const [isRejected, setIsRejected] = useState(false)

  useEffect(() => {
    async function fetchTopic() {
      try {
        const data = await getTopicDetail(subjectId, topicId)
        setTopic(data)
      } catch (error) {
        console.error("Error loading topic:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTopic()
  }, [subjectId, topicId])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMindMapFile(e.target.files[0])
    }
  }

  const handleCheck = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      const randomScore = Math.floor(Math.random() * 20) + 80
      const randomAi = Math.floor(Math.random() * 80)
      const randomPlagiarism = Math.floor(Math.random() * 60)

      setScore(randomScore)
      setAiScore(randomAi)
      setPlagiarismScore(randomPlagiarism)
      setIsAnalyzing(false)
      setShowResult(true)
    }, 2000)
  }

  const handleCreateDraft = () => {
    const draft = `# ${topic?.title || "Mavzu"}: Chuqur tahlil

## Kirish
${answers.q1.substring(0, 150)}...

## Asosiy qism
${answers.q2.substring(0, 200)}...

## Amaliy tatbiq
${answers.q3.substring(0, 200)}...

## Xulosa
Ushbu tahlil ${topic?.title || "mavzu"} mavzusidagi bilimlarni chuqurlashtirishga yordam beradi.`

    setDraftContent(draft)
    setShowDraftModal(true)
  }

  const handlePublish = () => {
    const rejected = plagiarismScore > MAX_PLAGIARISM_SCORE || aiScore > MAX_AI_SCORE

    if (rejected) {
      setIsRejected(true)
      setShowDraftModal(false)
    } else {
      alert(`Maqola ${isPaid ? "pullik" : "bepul"} tarzda avtomatik e'lon qilindi!`)
      setShowDraftModal(false)
      setShowResult(false)
      setAnswers({ q1: "", q2: "", q3: "" })
      setMindMapFile(null)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-8 lg:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-8 lg:p-10 text-center py-20">
        <h2 className="text-xl font-semibold text-slate-800">Mavzu topilmadi</h2>
        <p className="text-slate-500 mt-2">Kechirasiz, siz qidirayotgan mavzu mavjud emas.</p>
        <Link href={`/dashboard/lab/subjects/${subjectId}`} className="mt-4 inline-block text-teal-600 font-medium">
          Fanga qaytish
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-teal-50 border border-teal-200">
            <BookOpen className="h-5 w-5 text-teal-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{topic.title}</h1>
            <p className="text-sm text-slate-500">Chuqur o'quv va tahlil</p>
          </div>
        </div>
      </div>

      {/* Rejection Alert */}
      {isRejected && (
        <Card className="mb-8 border-rose-200 bg-rose-50 animate-in fade-in slide-in-from-top-4 duration-500">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle className="h-6 w-6 text-rose-600" />
              </div>
              <div className="space-y-3 flex-1">
                <div>
                  <h3 className="text-base font-bold text-rose-900">Sizning ishingiz qabul qilinmadi</h3>
                  <p className="text-sm text-rose-700 leading-relaxed mt-1">
                    Tizim javobingizda yuqori darajada sun'iy intellekt ({aiScore}%) yoki plagiat ({plagiarismScore}%) aniqladi.
                    Avtomatik chop etish uchun AI 70% dan, Plagiat esa 50% dan past bo'lishi kerak.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    className="border-rose-200 text-rose-700 hover:bg-rose-100"
                    onClick={() => {
                      setIsRejected(false)
                      setAnswers({ q1: "", q2: "", q3: "" })
                    }}
                  >
                    Qaytadan urinib ko'rish
                  </Button>
                  <Link href="/dashboard/support">
                    <Button className="bg-rose-600 hover:bg-rose-700 text-white w-full sm:w-auto">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Qo'llab-quvvatlash markaziga yozish
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Study Material — rendered from DB with dangerouslySetInnerHTML */}
      {(topic.content || topic.firstPrinciples) && (
        <Card className="mb-8 border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">O'quv materiali</CardTitle>
            <CardDescription>Mavzu yuzasidan barcha nazariy ma'lumotlar</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm sm:prose-base prose-slate max-w-none prose-headings:text-slate-800 prose-a:text-teal-600 prose-img:rounded-xl prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(topic.content || topic.firstPrinciples || '') }}
            />
          </CardContent>
        </Card>
      )}

      {/* First Principles — separate block if both exist */}
      {topic.content && topic.firstPrinciples && (
        <Card className="mb-8 border-teal-200 bg-teal-50/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Metodika (First Principles)
            </CardTitle>
            <CardDescription>Chuqurlashtirilgan tahlil</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm sm:prose-base prose-slate max-w-none prose-headings:text-slate-800 prose-img:rounded-xl prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(topic.firstPrinciples) }}
            />
          </CardContent>
        </Card>
      )}

      {/* Quizzes from DB */}
      {topic.quizzes && topic.quizzes.length > 0 ? (
        <Card className="mb-8 border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Bilim tekshiruvi va tahlil</CardTitle>
            <CardDescription>Mavzu bo'yicha savol-javoblar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {topic.quizzes.map((quiz, idx) => (
              <div key={quiz.id} className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  {idx + 1}. {quiz.question || `Savol #${idx + 1}`}
                </Label>
                {quiz.type === 'closed' && quiz.options ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {quiz.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700">
                        <span className="font-bold text-slate-400">{String.fromCharCode(65 + optIdx)}.</span> {opt}
                      </div>
                    ))}
                  </div>
                ) : (
                  <MiniEditor
                    value={answers[`q${idx + 1}` as keyof typeof answers] || ""}
                    onChange={(val) => setAnswers({ ...answers, [`q${idx + 1}`]: val })}
                    placeholder="Bu yerga yozing..."
                  />
                )}
              </div>
            ))}

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Mind Map yuklash (ixtiyoriy)</Label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                  mindMapFile ? "border-teal-300 bg-teal-50" : "border-slate-300 hover:border-teal-400"
                )}
                onClick={() => document.getElementById("mindmap-upload")?.click()}
              >
                <input id="mindmap-upload" type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                {mindMapFile ? (
                  <div className="flex items-center justify-center gap-2 text-teal-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">{mindMapFile.name}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-slate-400" />
                    <p className="text-sm text-slate-500">Mind map rasmini yuklash uchun bosing</p>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleCheck}
              disabled={isAnalyzing}
              className="w-full bg-slate-900 hover:bg-teal-700"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  AI tahlil qilmoqda...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Tekshirish
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Fallback quiz section when no quizzes in DB — keep the original 3-question flow */
        <Card className="mb-8 border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Bilim tekshiruvi va tahlil</CardTitle>
            <CardDescription>Chuqur savollar orqali tushunishingizni namoyish eting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                1. Ushbu mavzuning asosiy tushunchalarini o'z so'zlaringiz bilan tushuntiring
              </Label>
              <MiniEditor value={answers.q1} onChange={(val) => setAnswers({ ...answers, q1: val })} placeholder="Bu yerga yozing..." />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                2. Real hayotdan misol keltiring va uni qonuniy jihatdan tahlil qiling
              </Label>
              <MiniEditor value={answers.q2} onChange={(val) => setAnswers({ ...answers, q2: val })} placeholder="Bu yerga yozing..." />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                3. Ushbu bilimlarni amaliyotda qanday qo'llash mumkin?
              </Label>
              <MiniEditor value={answers.q3} onChange={(val) => setAnswers({ ...answers, q3: val })} placeholder="Bu yerga yozing..." />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Mind Map yuklash (ixtiyoriy)</Label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                  mindMapFile ? "border-teal-300 bg-teal-50" : "border-slate-300 hover:border-teal-400"
                )}
                onClick={() => document.getElementById("mindmap-upload-fallback")?.click()}
              >
                <input id="mindmap-upload-fallback" type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                {mindMapFile ? (
                  <div className="flex items-center justify-center gap-2 text-teal-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">{mindMapFile.name}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-slate-400" />
                    <p className="text-sm text-slate-500">Mind map rasmini yuklash uchun bosing</p>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleCheck}
              disabled={!answers.q1 || !answers.q2 || !answers.q3 || isAnalyzing}
              className="w-full bg-slate-900 hover:bg-teal-700"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  AI tahlil qilmoqda...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Tekshirish
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Mindmap from DB */}
      {topic.mindmapUrl && (
        <Card className="mb-8 border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-teal-700" />
              <CardTitle className="text-lg">Mind Map</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-md">
              <Image src={topic.mindmapUrl} alt="Mind Map" fill className="object-contain" sizes="100vw" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result Modal */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Natija tayyor!</DialogTitle>
            <DialogDescription>AI tahlilingizni baholadi</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                <span className="text-2xl font-bold">{score}%</span>
              </div>
              <Progress value={score} className="h-2" />
              <p className="text-sm text-slate-600">
                {score >= 86 ? "A'lo daraja!" : "Yaxshi, lekin rivojlantirish kerak"}
              </p>
            </div>
            {score >= 86 && (
              <Card className="border-teal-200 bg-teal-50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shrink-0">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 mb-1">Tabriklaymiz!</h3>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        Tahlilingiz a'lo darajada ({score}%). Buni maqola sifatida e'lon qilib, daromad topishni xohlaysizmi?
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleCreateDraft} className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800">
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI Draft Yaratish
                  </Button>
                </CardContent>
              </Card>
            )}
            <Button variant="outline" onClick={() => setShowResult(false)} className="w-full">Yopish</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Draft Editor Modal */}
      <Dialog open={showDraftModal} onOpenChange={setShowDraftModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-teal-600" />
              Maqola draftini tahrirlang
            </DialogTitle>
            <DialogDescription>AI sizning javoblaringizni birlashtirib, maqola yaratdi</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 min-h-[450px]">
            <AdvancedEditor value={draftContent} onChange={setDraftContent} />
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <Label htmlFor="paid-toggle" className="font-medium text-slate-800">Pullik maqola</Label>
                <p className="text-xs text-slate-500">O'quvchilar pul to'lab o'qishlari kerak</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={isPaid ? "default" : "secondary"}>{isPaid ? "Pullik" : "Bepul"}</Badge>
                <Button variant="outline" size="sm" onClick={() => setIsPaid(!isPaid)}>O'zgartirish</Button>
              </div>
            </div>
            <Button onClick={handlePublish} className="w-full bg-teal-600 hover:bg-teal-700" size="lg">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              E'lon qilish
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
