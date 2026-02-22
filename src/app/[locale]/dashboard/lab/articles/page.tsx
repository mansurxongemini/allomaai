"use client"

import { useState } from "react"
import { FileText, Plus, Shield, Sparkles, Eye, ThumbsUp, MessageSquare, BadgeCheck, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import AdvancedEditor from "@/components/ui/editor/AdvancedEditor"
import { cn } from "@/lib/utils"

const mockArticles = [
  {
    id: 1,
    title: "Jinoyat huquqida aybdorlik: Chuqur tahlil",
    author: "Aziza Karimova",
    excerpt: "Aybdorlik tushunchasi va uning turlari haqida keng qamrovli tahlil. Nazariya va amaliyot uyg'unligi...",
    plagiarism: 2,
    aiWriting: 14,
    isPaid: false,
    price: 0,
    views: 1243,
    likes: 89,
    comments: 23,
    verified: true,
    date: "2024-02-15"
  },
  {
    id: 2,
    title: "Shartnomalar huquqi: 10 ta muhim xatolik",
    author: "Bobur Rahimov",
    excerpt: "Ko'pchilik shartnoma tuzishda qanday xatolarga yo'l qo'yadi va ulardan qanday qochish mumkin...",
    plagiarism: 5,
    aiWriting: 8,
    isPaid: true,
    price: 15000,
    views: 2156,
    likes: 167,
    comments: 45,
    verified: true,
    date: "2024-02-18"
  },
  {
    id: 3,
    title: "Konstitutsiya huquqi: Fuqarolar erkinliklari",
    author: "Malika Usmanova",
    excerpt: "O'zbekiston Konstitutsiyasida belgilangan fuqarolar erkinliklari va ularning amaliy tatbiqi...",
    plagiarism: 3,
    aiWriting: 12,
    isPaid: false,
    price: 0,
    views: 987,
    likes: 72,
    comments: 18,
    verified: true,
    date: "2024-02-20"
  },
  {
    id: 4,
    title: "Mehnat nizolari: Sud amaliyoti",
    author: "Sardor Aliyev",
    excerpt: "2023-yilda ko'rilgan mehnat nizolari bo'yicha sud amaliyotidan xulosalar va tavsiyalar...",
    plagiarism: 1,
    aiWriting: 6,
    isPaid: true,
    price: 25000,
    views: 1876,
    likes: 134,
    comments: 56,
    verified: true,
    date: "2024-02-22"
  },
  {
    id: 5,
    title: "Mulk huquqi: Ijaraga berish nizolari",
    author: "Nigora Sharipova",
    excerpt: "Uy-joy ijarasida eng ko'p uchraydigan muammolar va ularni qonuniy hal qilish yo'llari...",
    plagiarism: 4,
    aiWriting: 15,
    isPaid: false,
    price: 0,
    views: 1432,
    likes: 98,
    comments: 34,
    verified: true,
    date: "2024-02-25"
  },
]

export default function ArticlesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newArticle, setNewArticle] = useState({
    title: "",
    content: "",
    isPaid: false,
    price: ""
  })

  const handleCreateArticle = () => {
    // Simulate article creation and AI/Plagiarism check
    alert("Maqola yaratildi va AI/Plagiat tekshiruvga yuborildi!")
    setShowCreateModal(false)
    setNewArticle({ title: "", content: "", isPaid: false, price: "" })
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Maqolalar</h1>
          <p className="text-slate-600">
            Hamjamiyat tomonidan yozilgan yuqori sifatli maqolalar
          </p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Yangi maqola
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-blue-600" />
                Yangi maqola yozish
              </DialogTitle>
              <DialogDescription>
                Maqolangiz AI va plagiat tekshiruvidan o'tadi
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Sarlavha</Label>
                <Input
                  id="title"
                  value={newArticle.title}
                  onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                  placeholder="Maqola sarlavhasi..."
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Matn</Label>
                <AdvancedEditor
                  value={newArticle.content}
                  onChange={(val) => setNewArticle({ ...newArticle, content: val })}
                />
              </div>

              {/* Pricing */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label>Maqola turi</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNewArticle({ ...newArticle, isPaid: !newArticle.isPaid })}
                  >
                    {newArticle.isPaid ? "Pullik" : "Bepul"}
                  </Button>
                </div>

                {newArticle.isPaid && (
                  <div className="space-y-2">
                    <Label htmlFor="price">Narxi (so'm)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newArticle.price}
                      onChange={(e) => setNewArticle({ ...newArticle, price: e.target.value })}
                      placeholder="Masalan: 15000"
                    />
                  </div>
                )}
              </div>

              {/* Info Box */}
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-blue-900">
                        Avtomatik tekshiruv
                      </p>
                      <p className="text-xs text-blue-700 leading-relaxed">
                        Maqolangiz e'lon qilinishdan oldin AI va plagiat tekshiruvidan o'tadi.
                        Natijalar sizning profilingizda ko'rsatiladi.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <Button
                onClick={handleCreateArticle}
                disabled={!newArticle.title || !newArticle.content}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                E'lon qilish va tekshirish
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-800 mb-1">24</div>
            <div className="text-xs text-slate-500">Jami maqolalar</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-teal-600 mb-1">18</div>
            <div className="text-xs text-slate-500">Bepul</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600 mb-1">6</div>
            <div className="text-xs text-slate-500">Premium</div>
          </CardContent>
        </Card>
      </div>

      {/* Articles Grid */}
      <div className="space-y-4">
        {mockArticles.map((article) => (
          <Card key={article.id} className="border-slate-200 hover:border-slate-300 hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    {article.verified && (
                      <BadgeCheck className="h-5 w-5 text-teal-600" />
                    )}
                  </div>
                  <CardDescription className="text-sm">
                    {article.author} • {article.date}
                  </CardDescription>
                </div>
                {article.isPaid && (
                  <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                    {article.price.toLocaleString('en-US')} so'm
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {article.excerpt}
              </p>

              {/* Verification Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700">
                    Plagiat: {article.plagiarism}%
                  </span>
                </div>
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 border rounded-lg",
                  article.aiWriting < 15
                    ? "bg-green-50 border-green-200"
                    : "bg-amber-50 border-amber-200"
                )}>
                  <Sparkles className={cn(
                    "h-4 w-4",
                    article.aiWriting < 15 ? "text-green-600" : "text-amber-600"
                  )} />
                  <span className={cn(
                    "text-xs font-medium",
                    article.aiWriting < 15 ? "text-green-700" : "text-amber-700"
                  )}>
                    AI: {article.aiWriting}%
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  <span>{article.views}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{article.likes}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  <span>{article.comments}</span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                O'qish
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
