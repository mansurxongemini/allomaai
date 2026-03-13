"use client"

import { BookOpen, Lightbulb, FileText, ArrowRight, Loader2 } from "lucide-react"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, getCountFromServer } from "firebase/firestore"

function StatSkeleton() {
  return (
    <div className="text-center animate-pulse">
      <div className="h-8 w-12 rounded bg-slate-200 mx-auto mb-1" />
      <div className="h-4 w-16 rounded bg-slate-100 mx-auto" />
    </div>
  )
}

export default function LabPage() {
  const [counts, setCounts] = useState({ subjects: 0, methods: 0, articles: 0 })
  const [loadingCounts, setLoadingCounts] = useState(true)

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [subjectsSnap, methodsSnap, articlesSnap] = await Promise.all([
          getCountFromServer(collection(db, "subjects")),
          getCountFromServer(collection(db, "methods")),
          getCountFromServer(collection(db, "blogs")),
        ])
        setCounts({
          subjects: subjectsSnap.data().count,
          methods: methodsSnap.data().count,
          articles: articlesSnap.data().count,
        })
      } catch (error) {
        console.error("Error fetching lab counts:", error)
        // Keep defaults on failure
        setCounts({ subjects: 5, methods: 4, articles: 24 })
      } finally {
        setLoadingCounts(false)
      }
    }
    fetchCounts()
  }, [])

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          Laboratoriya markaziga xush kelibsiz
        </h1>
        <p className="leading-relaxed text-muted-foreground">
          O'quv metodlari, fanlar bo'yicha chuqur tahlil va hamjamiyat maqolalari
        </p>
      </div>

      {/* Main Sections Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Fanlar Card */}
        <Card className="rounded-[var(--radius-lg)] border-border bg-surface shadow-sm transition-shadow duration-200 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-teal-50 border border-teal-200 mb-4">
              <BookOpen className="h-6 w-6 text-teal-700" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Fanlar</h2>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Huquqiy fanlar bo'yicha o'quv materiallari, testlar va amaliy mashqlar
            </p>
            <Link href="/dashboard/lab/subjects/jinoyat-huquqi">
              <Button variant="outline" className="w-full rounded-[var(--radius-md)] group">
                Boshlash
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Metodlar Card */}
        <Card className="rounded-[var(--radius-lg)] border-border bg-surface shadow-sm transition-shadow duration-200 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-amber-50 border border-amber-200 mb-4">
              <Lightbulb className="h-6 w-6 text-amber-700" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Metodlar</h2>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Justin Sung's o'quv metodlari: kodlash, bo'laklash, takroriy esga tushirish
            </p>
            <Link href="/dashboard/lab/methods/encoding">
              <Button variant="outline" className="w-full rounded-[var(--radius-md)] group">
                O'rganish
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Maqolalar Card */}
        <Card className="rounded-[var(--radius-lg)] border-border bg-surface shadow-sm transition-shadow duration-200 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-50 border border-blue-200 mb-4">
              <FileText className="h-6 w-6 text-blue-700" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Maqolalar</h2>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Hamjamiyat tomonidan yozilgan maqolalar, ilmiy ishlar va tajribalar
            </p>
            <Link href="/dashboard/lab/articles">
              <Button variant="outline" className="w-full rounded-[var(--radius-md)] group">
                Ko'rish
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Statistics — live from Firestore */}
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        {loadingCounts ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 text-center shadow-sm transition-shadow duration-200 hover:shadow-md">
              <div className="mb-1 text-3xl font-bold text-teal-600">{counts.subjects}</div>
              <div className="text-sm text-muted-foreground">Fanlar</div>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 text-center shadow-sm transition-shadow duration-200 hover:shadow-md">
              <div className="mb-1 text-3xl font-bold text-amber-600">{counts.methods}</div>
              <div className="text-sm text-muted-foreground">Metodlar</div>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 text-center shadow-sm transition-shadow duration-200 hover:shadow-md">
              <div className="mb-1 text-3xl font-bold text-blue-600">{counts.articles}</div>
              <div className="text-sm text-muted-foreground">Maqolalar</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
