"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Link, useRouter } from "@/i18n/routing"
import { Lightbulb, Loader2, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getMethodTopicDetail } from "@/services/firestore"
import { MethodTopic } from "@/types"
import DOMPurify from "dompurify"
import Image from "next/image"

export default function MethodTopicPage() {
    const params = useParams()
    const methodId = params.id as string
    const topicId = params.topicId as string
    const [topic, setTopic] = useState<MethodTopic | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchTopic() {
            try {
                const data = await getMethodTopicDetail(methodId, topicId)
                setTopic(data)
            } catch (error) {
                console.error("Error loading method topic:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchTopic()
    }, [methodId, topicId])

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6 md:p-8 lg:p-10 space-y-6">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
        )
    }

    if (!topic) {
        return (
            <div className="max-w-4xl mx-auto p-6 md:p-8 lg:p-10 text-center py-20">
                <h2 className="text-xl font-semibold text-slate-800">Dars topilmadi</h2>
                <p className="text-slate-500 mt-2">Kechirasiz, siz qidirayotgan dars mavjud emas.</p>
                <Link href={`/dashboard/lab/methods/${methodId}`} className="mt-4 inline-block text-amber-600 font-medium">
                    Metodga qaytish
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-8 lg:p-10">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-amber-50 border border-amber-200">
                        <Lightbulb className="h-5 w-5 text-amber-700" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{topic.title}</h1>
                        <p className="text-sm text-slate-500">Chuqur o'quv va tahlil</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {(topic.content) && (
                <Card className="mb-8 border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-lg">O'quv materiali</CardTitle>
                        <CardDescription>Darsning asosiy kontenti</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="prose prose-sm sm:prose-base prose-slate max-w-none prose-headings:text-slate-800 prose-a:text-teal-600 prose-img:rounded-xl prose-img:shadow-md"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(topic.content) }}
                        />
                    </CardContent>
                </Card>
            )}

            {/* First Principles / Methodology */}
            {topic.firstPrinciples && (
                <Card className="mb-8 border-amber-200 bg-amber-50/30">
                    <CardHeader>
                        <CardTitle className="text-lg">Metodika (First Principles)</CardTitle>
                        <CardDescription>Chuqurlashtirilgan tahlil</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="prose prose-sm sm:prose-base prose-slate max-w-none prose-headings:text-slate-800 prose-a:text-amber-600 prose-img:rounded-xl prose-img:shadow-md"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(topic.firstPrinciples) }}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Quizzes from DB */}
            {topic.quizzes && topic.quizzes.length > 0 && (
                <Card className="mb-8 border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-lg">Bilim tekshiruvi</CardTitle>
                        <CardDescription>Mavzu bo'yicha savol-javoblar</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {topic.quizzes.map((quiz, idx) => (
                            <div key={quiz.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                                <p className="text-sm font-semibold text-slate-800 mb-2">
                                    {idx + 1}. {quiz.question}
                                </p>
                                {quiz.type === 'closed' && quiz.options && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                        {quiz.options.map((opt, optIdx) => (
                                            <div key={optIdx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-700">
                                                <span className="font-bold text-slate-400">{String.fromCharCode(65 + optIdx)}.</span>
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {quiz.type === 'open' && (
                                    <p className="text-xs text-amber-600 italic mt-1">Ochiq savol — javobingizni yozing</p>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Mindmap */}
            {topic.mindmapUrl && (
                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-lg">Mind Map</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-md">
                            <Image src={topic.mindmapUrl} alt="Mind Map" fill className="object-contain" sizes="100vw" />
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
