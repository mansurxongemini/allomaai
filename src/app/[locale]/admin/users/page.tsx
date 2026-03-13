"use client"

import { Search, User, Mail, Shield, Calendar, Award, MoreHorizontal, Edit, Lock, Unlock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const mockUsers = [
    {
        id: "1",
        name: "Sardorbek",
        email: "sardor@gmail.com",
        level: 5,
        role: "Admin",
        joinedDate: "2026-01-10",
        status: "Active"
    },
    {
        id: "2",
        name: "Mansurxon",
        email: "mansurxon@alloma.ai",
        level: 4,
        role: "Admin",
        joinedDate: "2026-01-12",
        status: "Active"
    },
    {
        id: "3",
        name: "Zulfiya Ismoilova",
        email: "zulfiya@student.uz",
        level: 3,
        role: "Student",
        joinedDate: "2026-02-05",
        status: "Active"
    },
    {
        id: "4",
        name: "Bekzod Rahmonov",
        email: "bekzod.r@gmail.com",
        level: 2,
        role: "Student",
        joinedDate: "2026-02-15",
        status: "Blocked"
    },
    {
        id: "5",
        name: "Nilufar G'aniyeva",
        email: "nilufar.g@proton.me",
        level: 4,
        role: "Student",
        joinedDate: "2026-02-18",
        status: "Active"
    }
]

export default function UsersPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Foydalanuvchilar boshqaruvi</h1>
                    <p className="text-slate-500 text-sm mt-1">Platformadagi barcha foydalanuvchilarni ko'rishingiz va boshqarishingiz mumkin.</p>
                </div>
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                    <Input
                        placeholder="Ism yoki email orqali qidirish..."
                        className="pl-10 rounded-xl border-slate-200 bg-white focus:ring-teal-500/10 focus:border-teal-500/30 transition-all h-11"
                    />
                </div>
            </div>

            {/* Table Section */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-slate-200">
                                <TableHead className="py-4 pl-6 font-semibold text-slate-700">Foydalanuvchi</TableHead>
                                <TableHead className="py-4 font-semibold text-slate-700">Daraja</TableHead>
                                <TableHead className="py-4 font-semibold text-slate-700">Rol</TableHead>
                                <TableHead className="py-4 font-semibold text-slate-700">Qo'shilgan sana</TableHead>
                                <TableHead className="py-4 pr-6 text-right font-semibold text-slate-700">Harakatlar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockUsers.map((user) => (
                                <TableRow key={user.id} className="hover:bg-slate-50/30 border-slate-100 transition-colors group">
                                    <TableCell className="py-5 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold uppercase transition-transform group-hover:scale-105 duration-300",
                                                user.role === "Admin" ? "bg-teal-50 text-teal-700 border border-teal-100" : "bg-slate-100 text-slate-600 border border-slate-200"
                                            )}>
                                                {user.name[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-800 text-sm">{user.name}</span>
                                                <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <Mail className="w-3 h-3" />
                                                    {user.email}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                                            Daraja {user.level}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <Badge className={cn(
                                            "rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-none border-transparent",
                                            user.role === "Admin" ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-600"
                                        )}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-5 text-sm text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                            {user.joinedDate}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5 pr-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="w-9 h-9 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all shadow-none">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className={cn(
                                                "w-9 h-9 rounded-xl transition-all shadow-none",
                                                user.status === "Blocked" ? "text-rose-600 bg-rose-50" : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                            )}>
                                                {user.status === "Blocked" ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="w-9 h-9 text-slate-400 rounded-xl">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5 border-slate-200 shadow-xl shadow-slate-200/40">
                                                    <DropdownMenuItem className="rounded-lg cursor-pointer py-2 focus:bg-teal-50 focus:text-teal-700">
                                                        <Shield className="w-4 h-4 mr-2.5" />
                                                        Rolni o'zgartirish
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-lg cursor-pointer py-2 focus:bg-amber-50 focus:text-amber-700">
                                                        <Award className="w-4 h-4 mr-2.5" />
                                                        Mukofot berish
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
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
