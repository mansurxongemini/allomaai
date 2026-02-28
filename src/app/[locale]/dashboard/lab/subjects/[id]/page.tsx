"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Link, useRouter, usePathname } from "@/i18n/routing"
import { BookOpen, ChevronRight, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { getSubject, getTopics } from "@/services/firestore"
import { Subject, Topic } from "@/types"

const difficultyColors: Record<string, string> = {
  "Oson": "bg-green-50 text-green-700 border-green-200",
  "O'rta": "bg-amber-50 text-amber-700 border-amber-200",
  "Qiyin": "bg-red-50 text-red-700 border-red-200",
}

// Helper function to calculate pseudo-difficulty based on topic order
const getDifficulty = (order: number) => {
  if (order <= 3) return "Oson"
  if (order <= 7) return "O'rta"
  return "Qiyin"
}

// Simple HTML tag stripper for description
const stripHtml = (html: string) => {
  if (!html) return "Ushbu mavzuda foydali ma'lumotlar va materiallar keltirilgan."
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ""
}



export default function SubjectPage() {
  const params = useParams()
  const subjectId = params.id as string
  const [subject, setSubject] = useState<Subject | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [subjectData, topicsData] = await Promise.all([
          getSubject(subjectId),
          getTopics(subjectId)
        ])
        setSubject(subjectData)
        setTopics(topicsData)
      } catch (error) {
        console.error("Failed to load subject or topics:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [subjectId])

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-6 md:p-8 lg:p-10 space-y-8">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!subject) {
    return (
      <div className="max-w-5xl mx-auto p-6 md:p-8 lg:p-10 text-center py-20">
        <h2 className="text-xl font-semibold text-slate-800">Fan topilmadi</h2>
        <p className="text-slate-500 mt-2">Kechirasiz, siz qidirayotgan fan mavjud emas.</p>
        <Link href="/dashboard/lab" className="mt-4 inline-block text-teal-600 font-medium">
          Laboratoriyaga qaytish
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-teal-50 border border-teal-200">
            <BookOpen className="h-5 w-5 text-teal-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{subject.name}</h1>
            <p className="text-sm text-slate-500">Mavzularni tanlang va o'rganishni boshlang</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {topics.map((topic, index) => {
          const difficulty = getDifficulty(topic.order || index + 1)
          return (
            <Link
              key={topic.id}
              href={`/dashboard/lab/subjects/${subjectId}/${topic.id}`}
              className="group"
            >
              <Card className="border-slate-200 hover:border-teal-300 hover:shadow-md transition-all duration-200 h-full">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold shrink-0">
                        {topic.order || index + 1}
                      </div>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full border font-medium",
                        difficultyColors[difficulty]
                      )}>
                        {difficulty}
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-teal-700 transition-colors line-clamp-2">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mt-auto">
                    {stripHtml(topic.content || topic.firstPrinciples)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Empty State */}
      {topics.length === 0 && (
        <Card className="border-slate-200">
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">Hozircha mavzular mavjud emas</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
