"use client"

import { Link } from "@/i18n/routing"
import Image from "next/image"
import { PenTool, Lock, Unlock, Eye, Heart, MessageCircle, Plus, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"

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



export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const blogsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Blog[]
      setBlogs(blogsData)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-[calc(100dvh-52px-env(safe-area-inset-bottom))] md:min-h-[100dvh] bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-teal-50 border border-teal-200">
              <PenTool className="h-5 w-5 text-teal-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Bloglar</h1>
              <p className="text-sm text-slate-500">Jamoa maqolalari va tahlillar</p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Qidiruv..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-white border-slate-200 rounded-xl focus:ring-teal-500/20"
            />
          </div>
        </div>

        {/* Blogs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[400px] bg-white rounded-xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <p className="text-slate-500">Hech qanday maqola topilmadi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <Link key={blog.id} href={`/dashboard/blogs/${blog.id}`} className="group">
                <Card className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-700 flex flex-col h-full">
                  {/* Cover Image */}
                  <div className="relative h-48 w-full bg-slate-100">
                    <Image
                      src={blog.imageUrl || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=400&fit=crop"}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Paid/Free Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge
                        className={cn(
                          "px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-md border-0 gap-1.5",
                          blog.isPremium
                            ? "bg-amber-500/80 text-white"
                            : "bg-green-500/80 text-white"
                        )}
                      >
                        {blog.isPremium ? (
                          <>
                            <Lock className="h-3 w-3" />
                            Premium
                          </>
                        ) : (
                          <>
                            <Unlock className="h-3 w-3" />
                            Bepul
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold mb-2 line-clamp-2 text-gray-900 dark:text-white group-hover:text-teal-600 transition-colors duration-300">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
                      {blog.excerpt}
                    </p>

                    {/* Author and Date Footer */}
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="relative h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0 overflow-hidden">
                          {blog.authorImage ? (
                            <Image src={blog.authorImage} alt="" fill className="object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-teal-700">{blog.authorName?.[0]}</span>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                          {blog.authorName}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {blog.createdAt?.toDate ? blog.createdAt.toDate().toLocaleDateString() : "Hozirgina"}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
