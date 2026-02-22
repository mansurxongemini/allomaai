"use client"

import { Link } from "@/i18n/routing"
import { PenTool, Lock, Unlock, Eye, Heart, MessageCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const mockBlogs = [
  {
    id: "1",
    title: "Jinoyat huquqida qasd va ehtiyotsizlikning farqi: chuqur tahlil",
    excerpt: "Jinoyatning subyektiv tomonini o'rganish davomida ko'p talabalar qasd va ehtiyotsizlik o'rtasidagi farqni tushunishda qiynaladi...",
    author: {
      name: "Sardor Aliyev",
      avatar: "SA",
      avatarColor: "from-blue-500 to-blue-600",
    },
    date: "15 Yanvar 2026",
    coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=400&fit=crop",
    isPaid: false,
    stats: { views: 1243, likes: 89, comments: 23 },
  },
  {
    id: "2",
    title: "Fuqarolik shartnomalarida majburiyat buzilishi: amaliy misollar",
    excerpt: "Shartnomalar huquqi amaliyotida eng ko'p uchraydigan muammolardan biri bu majburiyat buzilishi holatlari...",
    author: {
      name: "Nigora Karimova",
      avatar: "NK",
      avatarColor: "from-purple-500 to-purple-600",
    },
    date: "12 Yanvar 2026",
    coverImage: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=400&fit=crop",
    isPaid: true,
    price: 25000,
    stats: { views: 2156, likes: 145, comments: 67 },
  },
  {
    id: "3",
    title: "O'zbekiston Konstitutsiyasi: inson huquqlari kafolatlari",
    excerpt: "Konstitutsiyaviy huquqlar va ularning kafolatlari har bir fuqaro uchun muhim. Keling, buni birga o'rganamiz...",
    author: {
      name: "Jasur Rahimov",
      avatar: "JR",
      avatarColor: "from-teal-500 to-teal-600",
    },
    date: "10 Yanvar 2026",
    coverImage: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=400&fit=crop",
    isPaid: false,
    stats: { views: 3421, likes: 234, comments: 89 },
  },
  {
    id: "4",
    title: "Mehnat shartnomasi: xodim huquqlari va majburiyatlari",
    excerpt: "Mehnat munosabatlarida shartnoma tuzish - bu ikki tomonning huquq va majburiyatlarini belgilovchi muhim hujjat...",
    author: {
      name: "Dilshod Tursunov",
      avatar: "DT",
      avatarColor: "from-amber-500 to-amber-600",
    },
    date: "8 Yanvar 2026",
    coverImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=400&fit=crop",
    isPaid: true,
    price: 15000,
    stats: { views: 987, likes: 67, comments: 12 },
  },
  {
    id: "5",
    title: "Administrativ javobgarlik: jarimalardan saqlanish yo'llari",
    excerpt: "Har bir fuqaro administrativ javobgarlikka tortilishi mumkin. Lekin bu qanday va undan qanday himoyalanish mumkin?",
    author: {
      name: "Malika Usmanova",
      avatar: "MU",
      avatarColor: "from-pink-500 to-pink-600",
    },
    date: "5 Yanvar 2026",
    coverImage: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&h=400&fit=crop",
    isPaid: false,
    stats: { views: 1876, likes: 123, comments: 45 },
  },
  {
    id: "6",
    title: "Xalqaro huquq: davlatlar o'rtasidagi munosabatlar asoslari",
    excerpt: "Xalqaro huquq - bu davlatlar, xalqaro tashkilotlar va boshqa sub'ektlar o'rtasidagi munosabatlarni tartibga soluvchi...",
    author: {
      name: "Aziz Normatov",
      avatar: "AN",
      avatarColor: "from-green-500 to-green-600",
    },
    date: "3 Yanvar 2026",
    coverImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=400&fit=crop",
    isPaid: true,
    price: 35000,
    stats: { views: 2341, likes: 178, comments: 56 },
  },
]

export default function BlogsPage() {
  return (
    <div className="min-h-[calc(100dvh-52px-env(safe-area-inset-bottom))] md:min-h-[100dvh] bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-teal-50 border border-teal-200">
              <PenTool className="h-5 w-5 text-teal-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Bloglar</h1>
              <p className="text-sm text-slate-500">Jamoa maqolalari va tahlillar</p>
            </div>
          </div>

          <Link href="/dashboard/blogs/create">
            <Button className="bg-teal-600 hover:bg-teal-700 gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Yangi Blog Yozish</span>
              <span className="sm:hidden">Yozish</span>
            </Button>
          </Link>
        </div>

        {/* Blogs Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockBlogs.map((blog) => (
            <Link key={blog.id} href={`/dashboard/blogs/${blog.id}`} className="group">
              <Card className="overflow-hidden border-slate-200 hover:shadow-lg hover:border-teal-200 transition-all duration-300 h-full flex flex-col">
                {/* Cover Image */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={blog.coverImage}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Paid/Free Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge
                      className={
                        blog.isPaid
                          ? "bg-amber-500 hover:bg-amber-600 text-white border-0 gap-1.5"
                          : "bg-green-500 hover:bg-green-600 text-white border-0 gap-1.5"
                      }
                    >
                      {blog.isPaid ? (
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
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2 line-clamp-2 group-hover:text-teal-700 transition-colors leading-snug">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-3 leading-relaxed flex-1">
                    {blog.excerpt}
                  </p>

                  {/* Author and Stats */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    {/* Author */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-8 w-8 rounded-full bg-gradient-to-br ${blog.author.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                      >
                        {blog.author.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {blog.author.name}
                        </p>
                        <p className="text-xs text-slate-500">{blog.date}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {blog.stats.views.toLocaleString('en-US')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" />
                        {blog.stats.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {blog.stats.comments}
                      </span>
                      {blog.isPaid && blog.price !== undefined && (
                        <span className="ml-auto font-semibold text-amber-600">
                          {blog.price.toLocaleString('en-US')} so'm
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
