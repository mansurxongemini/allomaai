"use client"

import {
    Users,
    FileText,
    Scale,
    DollarSign,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    Filter,
    Download
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const stats = [
    {
        title: "Jami Talabalar",
        value: "1,284",
        change: "+12.5%",
        trend: "up",
        icon: Users,
        color: "text-blue-600",
        bg: "bg-blue-50"
    },
    {
        title: "Kutilayotgan Maqolalar",
        value: "24",
        change: "+4.3%",
        trend: "up",
        icon: FileText,
        color: "text-amber-600",
        bg: "bg-amber-50"
    },
    {
        title: "Faol Kazuslar",
        value: "156",
        change: "-2.1%",
        trend: "down",
        icon: Scale,
        color: "text-teal-600",
        bg: "bg-teal-50"
    },
    {
        title: "Umumiy Daromad",
        value: "$12,450",
        change: "+18.2%",
        trend: "up",
        icon: DollarSign,
        color: "text-emerald-600",
        bg: "bg-emerald-50"
    }
]

const recentSubmissions = [
    {
        id: "1",
        title: "Raqamli iqtisodiyotda huquqiy tartibga solish",
        author: "Alisher Navoiy",
        plagiarism: "12%",
        ai: "8%",
        status: "Tasdiqlangan",
        date: "2 soat oldin"
    },
    {
        id: "2",
        title: "Sun'iy intellekt va mualliflik huquqi",
        author: "Zulfiya Isroilova",
        plagiarism: "5%",
        ai: "15%",
        status: "Kutilmoqda",
        date: "5 soat oldin"
    },
    {
        id: "3",
        title: "Xalqaro tijorat arbitraji masalalari",
        author: "Abdulla Qodiriy",
        plagiarism: "24%",
        ai: "4%",
        status: "Kutilmoqda",
        date: "1 kun oldin"
    },
    {
        id: "4",
        title: "O'zbekistonda ma'muriy islohotlar",
        author: "Bobur Mirzo",
        plagiarism: "8%",
        ai: "2%",
        status: "Tasdiqlangan",
        date: "2 kun oldin"
    },
    {
        id: "5",
        title: "Smart-kontraktlar va ularning huquqiy tabiati",
        author: "Oyxon Humoyun",
        plagiarism: "15%",
        ai: "32%",
        status: "Kutilmoqda",
        date: "3 kun oldin"
    }
]

export default function AdminDashboardPage() {
    return (
        <div className="animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Xush kelibsiz, Admin!</h2>
                    <p className="text-slate-500 mt-1">Platformadagi so'nggi yangiliklar va statistikalar.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        <span>Filtrlash</span>
                    </Button>
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        <span>Hisobot yuklash</span>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map((stat, index) => (
                    <Card key={index} className="border-none shadow-sm shadow-slate-200/50 bg-white hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden group">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                                    }`}>
                                    {stat.change}
                                    <ArrowUpRight className={`w-3 h-3 ${stat.trend === 'down' ? 'rotate-90' : ''}`} />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table Section */}
            <Card className="border-none shadow-sm shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
                <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="text-xl font-bold text-slate-900">So'nggi blog arizalari</CardTitle>
                        <CardDescription className="text-slate-500 mt-1">Talabalar tomonidan yuborilgan maqolalar va ularning tahlili.</CardDescription>
                    </div>
                    <Button variant="ghost" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 transition-all text-sm font-semibold">
                        Barchasini ko'rish
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="w-[400px] font-semibold text-slate-600 pl-6 py-4">Maqola nomi</TableHead>
                                <TableHead className="font-semibold text-slate-600 py-4">Muallif</TableHead>
                                <TableHead className="font-semibold text-slate-600 py-4">Plagiat %</TableHead>
                                <TableHead className="font-semibold text-slate-600 py-4">AI %</TableHead>
                                <TableHead className="font-semibold text-slate-600 py-4">Holati</TableHead>
                                <TableHead className="text-right font-semibold text-slate-600 pr-6 py-4">Harakat</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentSubmissions.map((submission) => (
                                <TableRow key={submission.id} className="group hover:bg-slate-50/30 border-slate-50 transition-colors">
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-800 line-clamp-1">{submission.title}</span>
                                            <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {submission.date}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">
                                                {submission.author[0]}
                                            </div>
                                            <span className="text-sm text-slate-600">{submission.author}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${parseInt(submission.plagiarism) > 20 ? 'bg-rose-500' : 'bg-emerald-500'
                                                }`} />
                                            <span className="text-sm font-medium text-slate-700">{submission.plagiarism}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${parseInt(submission.ai) > 30 ? 'bg-amber-500' : 'bg-teal-500'
                                                }`} />
                                            <span className="text-sm font-medium text-slate-700">{submission.ai}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <Badge variant="secondary" className={cn(
                                            "rounded-lg font-medium text-[11px] px-2 py-0.5",
                                            submission.status === "Tasdiqlangan"
                                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                        )}>
                                            {submission.status === "Tasdiqlangan" ? (
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                            ) : (
                                                <Clock className="w-3 h-3 mr-1" />
                                            )}
                                            {submission.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6 py-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 group-hover:opacity-100 transition-all">
                                                    <MoreHorizontal className="w-4 h-4 text-slate-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40 rounded-xl border-slate-200 p-1.5 shadow-xl shadow-slate-200/50">
                                                <DropdownMenuItem className="rounded-lg cursor-pointer focus:bg-teal-50 focus:text-teal-700">
                                                    Ko'rish
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="rounded-lg cursor-pointer focus:bg-teal-50 focus:text-teal-700">
                                                    Tasdiqlash
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="rounded-lg cursor-pointer focus:bg-rose-50 focus:text-rose-600">
                                                    Rad etish
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
