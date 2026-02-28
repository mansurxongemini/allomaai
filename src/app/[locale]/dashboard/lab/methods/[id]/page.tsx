"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Link, useRouter } from "@/i18n/routing"
import { Lightbulb, ChevronRight, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { getMethod, getMethodTopics } from "@/services/firestore"
import { Method, MethodTopic } from "@/types"

const stripHtml = (html: string) => {
  if (!html) return "Ushbu darsda foydali ma'lumotlar va materiallar keltirilgan."
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ""
}

export default function MethodPage() {
  const params = useParams()
  const methodId = params.id as string
  const [method, setMethod] = useState<Method | null>(null)
  const [topics, setTopics] = useState<MethodTopic[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [methodData, topicsData] = await Promise.all([
          getMethod(methodId),
          getMethodTopics(methodId)
        ])
        setMethod(methodData)
        setTopics(topicsData)
      } catch (error) {
        console.error("Failed to load method or topics:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [methodId])

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

  if (!method) {
    return (
      <div className="max-w-5xl mx-auto p-6 md:p-8 lg:p-10 text-center py-20">
        <h2 className="text-xl font-semibold text-slate-800">Metod topilmadi</h2>
        <p className="text-slate-500 mt-2">Kechirasiz, siz qidirayotgan metod mavjud emas.</p>
        <Link href="/dashboard/lab" className="mt-4 inline-block text-amber-600 font-medium">
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
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-amber-50 border border-amber-200">
            <Lightbulb className="h-5 w-5 text-amber-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{method.name}</h1>
            <p className="text-sm text-slate-500">Darslarni tanlang va o'rganishni boshlang</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {topics.map((topic, index) => (
          <Link
            key={topic.id}
            href={`/dashboard/lab/methods/${methodId}/${topic.id}`}
            className="group"
          >
            <Card className="border-slate-200 hover:border-amber-300 hover:shadow-md transition-all duration-200 h-full">
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-50 text-amber-700 text-sm font-bold shrink-0">
                      {topic.order || index + 1}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all duration-200" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-amber-700 transition-colors line-clamp-2">
                  {topic.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mt-auto">
                  {stripHtml(topic.content || topic.firstPrinciples)}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {topics.length === 0 && (
        <Card className="border-slate-200">
          <CardContent className="p-8 text-center">
            <Lightbulb className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">Hozircha darslar mavjud emas</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
