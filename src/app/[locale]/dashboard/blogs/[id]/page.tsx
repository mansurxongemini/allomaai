"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Link } from "@/i18n/routing"
import { ArrowLeft, Clock, Calendar, User, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { SafeHTML } from "@/components/SafeHTML"

interface Blog {
    id: string
    title: string
    excerpt: string
    content: string
    imageUrl: string
    isPremium: boolean
    tags: string[]
    authorName: string
    authorImage: string
    createdAt: any
}

export default function BlogDetailPage() {
    const params = useParams()
    const id = params.id as string
    const [blog, setBlog] = useState<Blog | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const docRef = doc(db, "blogs", id)
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    setBlog({ id: docSnap.id, ...docSnap.data() } as Blog)
                } else {
                    setError(true)
                }
            } catch (err) {
                console.error("Error fetching blog:", err)
                setError(true)
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchBlog()
        }
    }, [id])

    const calculateReadingTime = (text: string) => {
        const wordsPerMinute = 200
        const words = text.split(/\s+/).length
        const minutes = Math.ceil(words / wordsPerMinute)
        return `${minutes} daqiqa`
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="max-w-4xl mx-auto p-6 md:p-10">
                    <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse mb-8" />
                    <div className="w-full h-[400px] bg-slate-200 rounded-2xl animate-pulse mb-8" />
                    <div className="h-12 w-3/4 bg-slate-200 rounded-lg animate-pulse mb-6" />
                    <div className="flex gap-4 mb-8 pb-8 border-b border-slate-100">
                        <div className="h-12 w-12 rounded-full bg-slate-200 animate-pulse" />
                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
                        <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
                        <div className="h-4 w-5/6 bg-slate-200 rounded animate-pulse" />
                    </div>
                </div>
            </div>
        )
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
                <div className="h-20 w-20 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
                    <Pencil className="h-10 w-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Maqola topilmadi</h1>
                <p className="text-slate-500 mb-8 max-w-xs">Bu maqola o'chirib tashlangan yoki havola noto'g'ri bo'lishi mumkin.</p>
                <Button asChild variant="outline">
                    <Link href="/dashboard/blogs">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Bloglarga qaytish
                    </Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
                {/* Navigation */}
                <Link
                    href="/dashboard/blogs"
                    className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors mb-8 group"
                >
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Barcha maqolalar
                </Link>

                {/* Cover Image */}
                <div className="relative w-full h-[300px] md:h-[450px] mb-10 rounded-3xl overflow-hidden shadow-xl shadow-teal-900/5">
                    <Image
                        src={blog.imageUrl || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=600&fit=crop"}
                        alt={blog.title}
                        fill
                        className="object-cover"
                    />
                    {blog.isPremium && (
                        <div className="absolute top-4 left-4">
                            <Badge className="bg-amber-500 text-white border-0 px-4 py-1.5 text-xs font-bold rounded-full shadow-lg backdrop-blur-md">
                                PREMIUM
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight md:leading-tight mb-8">
                    {blog.title}
                </h1>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-6 mb-10 pb-10 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center overflow-hidden">
                            {blog.authorImage ? (
                                <Image src={blog.authorImage} alt={blog.authorName} fill className="object-cover" />
                            ) : (
                                <User className="h-6 w-6 text-teal-600" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">{blog.authorName}</p>
                            <p className="text-xs text-slate-500">Muallif</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-slate-400">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                {blog.createdAt?.toDate ? blog.createdAt.toDate().toLocaleDateString() : "Hozirgina"}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium">{calculateReadingTime(blog.content)} o'qish</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="prose prose-lg md:prose-xl dark:prose-invert max-w-none mx-auto
          prose-headings:text-slate-900 prose-headings:font-black
          prose-p:text-slate-600 prose-p:leading-relaxed
          prose-strong:text-slate-900
          prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-3xl prose-img:shadow-lg
          prose-blockquote:border-l-teal-500 prose-blockquote:bg-teal-50/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:italic
          prose-ul:list-disc prose-ul:marker:text-teal-500
          prose-ol:list-decimal prose-ol:marker:text-teal-500 prose-ol:font-bold">
                    <SafeHTML html={blog.content} />
                </div>

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                    <div className="mt-16 flex flex-wrap gap-2">
                        {blog.tags.map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-0 px-4 py-1 rounded-lg text-xs font-medium">
                                #{tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
