"use client"

import { Link } from "@/i18n/routing"
import Image from "next/image"
import { PenTool, Lock, Unlock, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

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
    <div className="mx-auto min-h-[calc(100dvh-52px-env(safe-area-inset-bottom))] w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-primary/15 bg-primary/10">
              <PenTool className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Bloglar</h1>
              <p className="text-sm text-muted-foreground">Jamoa maqolalari va tahlillar</p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
            <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Qidiruv..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 rounded-[var(--radius-md)] border-border bg-surface pl-10"
            />
          </div>
            <Button asChild className="rounded-[var(--radius-md)]">
              <Link href="/dashboard/blogs/create">Yangi blog</Link>
            </Button>
          </div>
        </div>

        {/* Blogs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[400px] animate-pulse rounded-[var(--radius-lg)] border border-border bg-surface" />
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <Empty className="rounded-[var(--radius-lg)] border border-dashed border-border bg-surface py-20 shadow-sm">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-primary/10 text-primary">
                <PenTool className="h-5 w-5" />
              </EmptyMedia>
              <EmptyTitle className="text-foreground">Ma&apos;lumot yo&apos;q</EmptyTitle>
              <EmptyDescription>Qidiruv bo&apos;yicha blog topilmadi. Yangi blog yarating yoki boshqa kalit so&apos;z bilan urinib ko&apos;ring.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link href="/dashboard/blogs/create">Yangi blog yaratish</Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <Link key={blog.id} href={`/dashboard/blogs/${blog.id}`} className="group">
                <Card className="h-full overflow-hidden rounded-[var(--radius-lg)] border-border bg-surface shadow-sm transition-shadow duration-200 hover:shadow-md">
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
                    <h3 className="mb-2 line-clamp-2 text-lg font-bold text-foreground transition-colors duration-200 group-hover:text-primary">
                      {blog.title}
                    </h3>
                    <p className="mb-4 flex-1 line-clamp-3 text-sm text-muted-foreground">
                      {blog.excerpt}
                    </p>

                    {/* Author and Date Footer */}
                    <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                      <div className="flex items-center gap-2">
                        <div className="relative h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0 overflow-hidden">
                          {blog.authorImage ? (
                            <Image src={blog.authorImage} alt="" fill className="object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-teal-700">{blog.authorName?.[0]}</span>
                          )}
                        </div>
                        <span className="max-w-[120px] truncate text-sm font-medium text-slate-700">
                          {blog.authorName}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
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
  )
}
