"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { toast } from "sonner"
import { Loader2, MessageSquare, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label-custom" // or "@/components/ui/label" depending on setup
import { Textarea } from "@/components/ui/inputs/textarea" // or regular textarea 

export default function SupportPage() {
    const { currentUser } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form States
    const [name, setName] = useState(currentUser?.displayName || "")
    const [email, setEmail] = useState(currentUser?.email || "")
    const [subject, setSubject] = useState("")
    const [category, setCategory] = useState("Texnik muammo")
    const [message, setMessage] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name || !email || !subject || !message) {
            toast.error("Iltimos, barcha maydonlarni to'ldiring")
            return
        }

        setIsSubmitting(true)

        try {
            // Create ticket
            const ticketsRef = collection(db, "tickets")
            const newTicket = await addDoc(ticketsRef, {
                userId: currentUser?.uid || "mehmon",
                userName: name,
                userEmail: email,
                subject,
                category,
                status: "Kutilyapti",
                createdAt: serverTimestamp()
            })

            // Add initial message
            const messagesRef = collection(db, "tickets", newTicket.id, "messages")
            await addDoc(messagesRef, {
                sender: "user",
                text: message,
                createdAt: serverTimestamp()
            })

            toast.success("Murojaatingiz qabul qilindi, tez orada javob beramiz")

            // Clean up form
            setSubject("")
            setMessage("")
            // We do not reset name and email if they are auto-filled
        } catch (error) {
            console.error("Error submitting ticket:", error)
            toast.error("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-xl w-full">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-600 mb-6">
                        <MessageSquare className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Qo'llab-quvvatlash</h2>
                    <p className="mt-3 text-lg text-slate-500">
                        Savollaringiz bormi yoki muammoga duch keldingizmi? Bizga yozing, tez orada aloqaga chiqamiz.
                    </p>
                </div>

                <Card className="border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-white border-b border-slate-100 pb-6">
                        <CardTitle className="text-xl">Murojaat yuborish</CardTitle>
                        <CardDescription>Barcha maydonlarni to'ldirishingizni so'raymiz.</CardDescription>
                    </CardHeader>
                    <CardContent className="bg-white p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Ismingiz</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={!!currentUser}
                                        className="h-11 bg-slate-50"
                                        placeholder="Ali Valiyev"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={!!currentUser}
                                        className="h-11 bg-slate-50"
                                        placeholder="ali@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Murojaat toifasi</Label>
                                <select
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="flex h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="Texnik muammo">Texnik muammo</option>
                                    <option value="To'lov tizimi">To'lov tizimi</option>
                                    <option value="Kurs bo'yicha">Kurs bo'yicha savol</option>
                                    <option value="Boshqa">Boshqa</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject">Murojaat mavzusi</Label>
                                <Input
                                    id="subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="h-11 bg-slate-50"
                                    placeholder="Masalan: Saytga kira olmayapman"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Xabar matni</Label>
                                <textarea
                                    id="message"
                                    rows={5}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="flex w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                    placeholder="Muammo yoki savolingizni batafsil yozib qoldiring..."
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 text-base font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-600/20"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Yuborilmoqda...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-5 w-5" />
                                        Xabarni yuborish
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
