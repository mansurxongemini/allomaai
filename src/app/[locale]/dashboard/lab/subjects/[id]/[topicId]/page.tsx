"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Link, usePathname, useRouter } from "@/i18n/routing"
import { BookOpen, Upload, CheckCircle2, Sparkles, TrendingUp, BadgeCheck, FileText, CheckCircle, Brain, Plus, AlertCircle, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import MiniEditor from "@/components/ui/editor/MiniEditor"
import AdvancedEditor from "@/components/ui/editor/AdvancedEditor"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const topicContent: Record<string, { title: string; content: string }> = {
  "jinoyat-tushunchasi": {
    title: "Jinoyat tushunchasi va belgilari",
    content: `# Jinoyat tushunchasi va belgilari

## Kirish
Jinoyat - bu qonunda nazarda tutilgan va jamiyat uchun xavfli bo'lgan, aybdor shaxsga nisbatan jazo choralarini qo'llashga asos bo'lgan huquqbuzarlik.

## Jinoyatning asosiy belgilari

### 1. Jamiyat uchun xavflilik
Bu jinoyatning eng muhim belgisidir. Har qanday jinoyat jamiyat uchun xavf tug'diradi va jamiyat manfaatlariga zarar yetkazadi.

### 2. Qonunga xiloflik
Jinoyat - bu faqat qonunda jinoyat deb e'lon qilingan xatti-harakat. Agar qonunda nazarda tutilmagan bo'lsa, jinoyat bo'lmaydi.

### 3. Aybdorlik
Shaxs faqat aybdor bo'lganda jinoyat sodir etgan hisoblanadi. Aybdorlik - bu shaxsning o'z xatti-harakatiga nisbatan ma'lum ruhiy munosabati.

### 4. Jazolanishi
Har bir jinoyat uchun qonunda jazo nazarda tutilgan bo'lishi kerak.

## Justin Sung metodini qo'llash

### Kodlash (Encoding)
Har bir jinoyat belgilarini real hayotiy holat bilan bog'lang. Masalan, o'g'irlik holatini tahlil qilayotganda:
- Jamiyat uchun xavflilik: Mulkdorning huquqi buziladi
- Qonunga xiloflik: JK 169-modda
- Aybdorlik: Shaxs bilgan holda o'g'irlamoqchi bo'lgan
- Jazolanishi: Jarima yoki ozodlikdan mahrum etish

### Chunking (Bo'laklash)
Jinoyatlarni guruhlarga ajrating:
- **Shaxsga qarshi jinoyatlar** (hayot, sog'lik, erkinlik)
- **Mulkka qarshi jinoyatlar** (o'g'irlik, talon-taroj)
- **Davlat xavfsizligiga qarshi jinoyatlar**

### Faol eslash (Active Recall)
Har kuni o'zingizga savol bering:
- Jinoyatning 4 belgisi nimalar?
- Qaysi holatda xatti-harakat jinoyat bo'lmaydi?
- Aybdorliksiz jinoyat bo'lishi mumkinmi?`,
  },
  "qasd-ehtiyotsizlik": {
    title: "Qasd va ehtiyotsizlik",
    content: `# Qasd va ehtiyotsizlik

## Jinoyatning subyektiv tomonlari

Aybdorlik - bu shaxsning o'z jinoyat xatti-harakatiga va uning oqibatlariga nisbatan ruhiy munosabati.

### Qasd shakllari

**1. To'g'ridan-to'g'ri qasd**
Shaxs o'z xatti-harakatining jamiyat uchun xavfli ekanligini anglab yetadi, uning oqibatlarini oldindan ko'ra biladi va bu oqibatlarning yuzaga kelishini xohlaydi.

**2. Bilvosita qasd**
Shaxs o'z xatti-harakatining xavfli ekanligini anglab yetadi, oqibatlarni oldindan ko'ra biladi, lekin ularning yuzaga kelishini xohlamaydi, ammo ongli ravishda yo'l qo'yadi.

### Ehtiyotsizlik

**1. Beparvolik**
Shaxs o'z xatti-harakatining xavfli ekanligini anglab yetadi, oqibatlarni oldindan ko'ra biladi, lekin ularni oldini olish imkoniyati bor deb o'ylaydi.

**2. Ehtiyotsizlik**
Shaxs o'z xatti-harakatining xavfli ekanligini anglab yetmaydi yoki oqibatlarni oldindan ko'ra bilmaydi.`,
  },
}

const mockMindMaps = [
  {
    id: "mm1",
    title: "Asosiy tushunchalar xaritasi",
    author: "Sardor Alimov",
    uploadedAt: "2026-02-20",
    nodes: 12,
    connections: 18,
  },
  {
    id: "mm2",
    title: "Qonuniy asoslar tuzilmasi",
    author: "Malika Rahimova",
    uploadedAt: "2026-02-18",
    nodes: 8,
    connections: 11,
  },
  {
    id: "mm3",
    title: "Amaliy misollar bog'lanishi",
    author: "Jasur Toshmatov",
    uploadedAt: "2026-02-15",
    nodes: 15,
    connections: 22,
  },
]

const mockArticles = [
  {
    id: "a1",
    title: "Jinoyat belgilarini aniqlashda amaliy yondashuv",
    author: "Dilshod Karimov",
    views: 342,
    likes: 28,
    isPaid: false,
    plagiarism: 5,
    aiScore: 12,
  },
  {
    id: "a2",
    title: "Sud amaliyotida jinoyat tushunchasini talqin qilish",
    author: "Malika Yusupova",
    views: 589,
    likes: 47,
    isPaid: true,
    price: 25000,
    plagiarism: 3,
    aiScore: 8,
  },
  {
    id: "a3",
    title: "Jinoyatning jamiyat uchun xavflilik mezonlari",
    author: "Rustam Abdullayev",
    views: 421,
    likes: 35,
    isPaid: false,
    plagiarism: 7,
    aiScore: 15,
  },
]

const MAX_AI_SCORE = 70;
const MAX_PLAGIARISM_SCORE = 50;

export default function TopicPage() {
  const params = useParams()
  const router = useRouter()
  const topicId = params.topicId as string
  const topic = topicContent[topicId] || { title: "Mavzu", content: "Ma'lumot topilmadi" }

  const [answers, setAnswers] = useState({
    q1: "",
    q2: "",
    q3: "",
  })
  const [mindMapFile, setMindMapFile] = useState<File | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [score, setScore] = useState(0)
  const [showDraftModal, setShowDraftModal] = useState(false)
  const [draftContent, setDraftContent] = useState("")
  const [isPaid, setIsPaid] = useState(false)
  const [aiScore, setAiScore] = useState(0);
  const [plagiarismScore, setPlagiarismScore] = useState(0);
  const [isRejected, setIsRejected] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMindMapFile(e.target.files[0])
    }
  }

  const handleCheck = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      const randomScore = Math.floor(Math.random() * 20) + 80
      const randomAi = Math.floor(Math.random() * 80) // 0-80
      const randomPlagiarism = Math.floor(Math.random() * 60) // 0-60

      setScore(randomScore)
      setAiScore(randomAi)
      setPlagiarismScore(randomPlagiarism)
      setIsAnalyzing(false)
      setShowResult(true)
    }, 2000)
  }

  const handleCreateDraft = () => {
    const draft = `# ${topic.title}: Chuqur tahlil

## Kirish
${answers.q1.substring(0, 150)}...

## Asosiy qism
${answers.q2.substring(0, 200)}...

## Amaliy tatbiq
${answers.q3.substring(0, 200)}...

## Xulosa
Ushbu tahlil ${topic.title} mavzusidagi bilimlarni chuqurlashtirishga yordam beradi.`

    setDraftContent(draft)
    setShowDraftModal(true)
  }

  const handlePublish = () => {
    const rejected = plagiarismScore > MAX_PLAGIARISM_SCORE || aiScore > MAX_AI_SCORE;

    if (rejected) {
      setIsRejected(true);
      setShowDraftModal(false);
    } else {
      alert(`Maqola ${isPaid ? "pullik" : "bepul"} tarzda avtomatik e'lon qilindi!`);
      setShowDraftModal(false);
      setShowResult(false);
      setAnswers({ q1: "", q2: "", q3: "" });
      setMindMapFile(null);
    }
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
                      setIsRejected(false);
                      setAnswers({ q1: "", q2: "", q3: "" });
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
                <p className="text-[10px] text-rose-500 italic">
                  Agar tizim xato ishlagan deb hisoblasangiz, biz bilan bog'laning.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Study Material */}
      <Card className="mb-8 border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">O'quv materiali</CardTitle>
          <CardDescription>Justin Sung metodlari qo'llanilgan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-slate max-w-none text-sm leading-relaxed">
            <div className="whitespace-pre-line">{topic.content}</div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Section */}
      <Card className="mb-8 border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Bilim tekshiruvi va tahlil</CardTitle>
          <CardDescription>
            Chuqur savollar orqali tushunishingizni namoyish eting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="q1" className="text-sm font-medium text-slate-700">
              1. Ushbu mavzuning asosiy tushunchalarini o'z so'zlaringiz bilan tushuntiring
            </Label>
            <MiniEditor
              value={answers.q1}
              onChange={(val) => setAnswers({ ...answers, q1: val })}
              placeholder="Bu yerga yozing..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="q2" className="text-sm font-medium text-slate-700">
              2. Real hayotdan misol keltiring va uni qonuniy jihatdan tahlil qiling
            </Label>
            <MiniEditor
              value={answers.q2}
              onChange={(val) => setAnswers({ ...answers, q2: val })}
              placeholder="Bu yerga yozing..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="q3" className="text-sm font-medium text-slate-700">
              3. Ushbu bilimlarni amaliyotda qanday qo'llash mumkin?
            </Label>
            <MiniEditor
              value={answers.q3}
              onChange={(val) => setAnswers({ ...answers, q3: val })}
              placeholder="Bu yerga yozing..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Mind Map yuklash (ixtiyoriy)
            </Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                mindMapFile ? "border-teal-300 bg-teal-50" : "border-slate-300 hover:border-teal-400"
              )}
              onClick={() => document.getElementById("mindmap-upload")?.click()}
            >
              <input
                id="mindmap-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              {mindMapFile ? (
                <div className="flex items-center justify-center gap-2 text-teal-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">{mindMapFile.name}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-slate-400" />
                  <p className="text-sm text-slate-500">
                    Mind map rasmini yuklash uchun bosing
                  </p>
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
        </CardContent >
      </Card >

      {/* Related Articles Section - Task 4 */}
      < Card className="border-slate-200" >
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-700" />
            <CardTitle className="text-lg">Ushbu mavzuga doir jamoa maqolalari</CardTitle>
          </div>
          <CardDescription>
            Jamoa a'zolari tomonidan yozilgan eng yaxshi maqolalar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockArticles.map((article) => (
              <Card key={article.id} className="border-slate-200 hover:border-teal-300 hover:shadow-sm transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-800 line-clamp-1 mb-1">
                        {article.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {article.author} • {article.views} ko'rishlar • {article.likes} yoqtirish
                      </p>
                    </div>
                    {article.isPaid && article.price !== undefined && (
                      <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 shrink-0">
                        {article.price.toLocaleString('en-US')} so'm
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        article.plagiarism < 10
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      )}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Plagiat: {article.plagiarism}%
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        article.aiScore < 15
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      )}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Yozish: {article.aiScore}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card >

      {/* Mind Maps Section */}
      < Card className="mt-8 border-slate-200" >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-teal-700" />
              <CardTitle className="text-lg">Ushbu mavzu bo'yicha Mind Map'lar</CardTitle>
            </div>
            <button
              type="button"
              onClick={() => document.getElementById("mindmap-section-upload")?.click()}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-medium text-white hover:bg-teal-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Yuklash
            </button>
          </div>
          <CardDescription>
            Mavzuni vizual tarzda o'rganish uchun mind map'lar
          </CardDescription>
          <input
            id="mindmap-section-upload"
            type="file"
            accept="image/*"
            className="hidden"
          />
        </CardHeader>
        <CardContent>
          {mockMindMaps.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockMindMaps.map((mm) => (
                <div
                  key={mm.id}
                  className="group relative rounded-xl border border-slate-200 bg-white p-4 hover:border-teal-300 hover:shadow-md transition-all duration-200"
                >
                  {/* Placeholder visual */}
                  <div className="flex items-center justify-center h-28 rounded-lg bg-gradient-to-br from-slate-50 to-teal-50 border border-dashed border-slate-200 mb-3">
                    <Brain className="h-10 w-10 text-teal-300" />
                  </div>
                  {/* Title */}
                  <h4 className="text-sm font-semibold text-slate-800 group-hover:text-teal-700 transition-colors line-clamp-1 mb-1">
                    {mm.title}
                  </h4>
                  {/* Metadata */}
                  <p className="text-xs text-slate-500 mb-2">{mm.author}</p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{mm.nodes} tugun, {mm.connections} bog'lanish</span>
                    <span>{new Date(mm.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center">
              <Brain className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">
                Hozircha mind map mavjud emas
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Birinchi mind map'ni yuklang
              </p>
            </div>
          )}
        </CardContent>
      </Card >

      {/* Result Modal */}
      < Dialog open={showResult} onOpenChange={setShowResult} >
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
                      <h3 className="font-semibold text-slate-800 mb-1">
                        Tabriklaymiz!
                      </h3>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        Tahlilingiz a'lo darajada ({score}%). Buni maqola sifatida e'lon qilib,
                        daromad topishni xohlaysizmi?
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleCreateDraft}
                    className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI Draft Yaratish
                  </Button>
                </CardContent>
              </Card>
            )}

            <Button variant="outline" onClick={() => setShowResult(false)} className="w-full">
              Yopish
            </Button>
          </div>
        </DialogContent>
      </Dialog >

      {/* Draft Editor Modal */}
      < Dialog open={showDraftModal} onOpenChange={setShowDraftModal} >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-teal-600" />
              Maqola draftini tahrirlang
            </DialogTitle>
            <DialogDescription>
              AI sizning javoblaringizni birlashtirib, maqola yaratdi
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 min-h-[450px]">
            <AdvancedEditor
              value={draftContent}
              onChange={setDraftContent}
            />

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <Label htmlFor="paid-toggle" className="font-medium text-slate-800">
                  Pullik maqola
                </Label>
                <p className="text-xs text-slate-500">
                  O'quvchilar pul to'lab o'qishlari kerak
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={isPaid ? "default" : "secondary"}>
                  {isPaid ? "Pullik" : "Bepul"}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPaid(!isPaid)}
                >
                  O'zgartirish
                </Button>
              </div>
            </div>

            <Button onClick={handlePublish} className="w-full bg-teal-600 hover:bg-teal-700" size="lg">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              E'lon qilish
            </Button>
          </div>
        </DialogContent>
      </Dialog >
    </div >
  )
}
