"use client"

import { BookOpen, Lightbulb, FileText, ArrowRight } from "lucide-react"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function LabPage() {
  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Laboratoriya markaziga xush kelibsiz
        </h1>
        <p className="text-slate-600 leading-relaxed">
          O'quv metodlari, fanlar bo'yicha chuqur tahlil va hamjamiyat maqolalari
        </p>
      </div>

      {/* Main Sections Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Fanlar Card */}
        <Card className="border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-teal-50 border border-teal-200 mb-4">
              <BookOpen className="h-6 w-6 text-teal-700" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Fanlar</h2>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Huquqiy fanlar bo'yicha o'quv materiallari, testlar va amaliy mashqlar
            </p>
            <Link href="/dashboard/lab/subjects/jinoyat-huquqi">
              <Button variant="outline" className="w-full group">
                Boshlash
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Metodlar Card */}
        <Card className="border-slate-200 hover:border-amber-300 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-amber-50 border border-amber-200 mb-4">
              <Lightbulb className="h-6 w-6 text-amber-700" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Metodlar</h2>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Justin Sung's o'quv metodlari: kodlash, bo'laklash, takroriy esga tushirish
            </p>
            <Link href="/dashboard/lab/methods/encoding">
              <Button variant="outline" className="w-full group">
                O'rganish
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Maqolalar Card */}
        <Card className="border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-50 border border-blue-200 mb-4">
              <FileText className="h-6 w-6 text-blue-700" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Maqolalar</h2>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Hamjamiyat tomonidan yozilgan maqolalar, ilmiy ishlar va tajribalar
            </p>
            <Link href="/dashboard/lab/articles">
              <Button variant="outline" className="w-full group">
                Ko'rish
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="mt-12 grid grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-teal-600 mb-1">5</div>
          <div className="text-sm text-slate-600">Fanlar</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-amber-600 mb-1">4</div>
          <div className="text-sm text-slate-600">Metodlar</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">24</div>
          <div className="text-sm text-slate-600">Maqolalar</div>
        </div>
      </div>
    </div>
  )
}
