"use client"

import { useState, useEffect, useRef } from "react"
import { User, BookOpen, Palette, Shield, Upload, X, Loader2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"
import { compressImageToBase64 } from "@/lib/utils"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type SettingsTab = "profil" | "fanlar" | "korinish" | "xavfsizlik"

const availableSubjects = [
  "Jinoyat huquqi",
  "Fuqarolik huquqi",
  "Konstitutsiya huquqi",
  "Mehnat huquqi",
  "Administrativ huquq",
  "Xalqaro huquq",
  "Korxona huquqi",
  "Ekologiya huquqi",
  "Mol-mulk huquqi",
  "Oila huquqi",
]

export default function SettingsPage() {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingsTab>("profil")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Profile State
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [photoURL, setPhotoURL] = useState("")

  // Preferences State
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(["Jinoyat huquqi", "Fuqarolik huquqi"])
  const [searchTerm, setSearchTerm] = useState("")
  const [fontSize, setFontSize] = useState("medium")
  const [theme, setTheme] = useState("light")

  // Security State
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) return

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          setName(data.displayName || currentUser.displayName || "")
          setBio(data.bio || "")
          setPhotoURL(data.photoURL || currentUser.photoURL || "")
          if (data.subjects) setSelectedSubjects(data.subjects)
          if (data.preferences?.theme) setTheme(data.preferences.theme)
        } else {
          // Fallback if user doc doesn't exist yet but auth does
          setName(currentUser.displayName || "")
          setPhotoURL(currentUser.photoURL || "")
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast.error("Ma'lumotlarni yuklashda xatolik")
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [currentUser])

  const filteredSubjects = availableSubjects.filter(
    (subject) =>
      subject.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedSubjects.includes(subject)
  )

  const addSubject = (subject: string) => {
    setSelectedSubjects([...selectedSubjects, subject])
    setSearchTerm("")
  }

  const removeSubject = (subject: string) => {
    setSelectedSubjects(selectedSubjects.filter((s) => s !== subject))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Rasm hajmi 2MB dan kichik bo'lishi kerak")
      return
    }

    try {
      // Show optimistic UI update (temporary data URL without strong compression)
      const tempUrl = URL.createObjectURL(file)
      setPhotoURL(tempUrl)
      toast.info("Rasm tayyorlanmoqda, saqlash tugmasini bosing")

      // Store the file to be compressed upon save
      // We will handle the compression in the handleSave function
      // For immediate preview, URL.createObjectURL is fine.
    } catch (error) {
      console.error("Error processing image:", error)
      toast.error("Rasm bilan ishlashda xatolik")
    }
  }

  const handleSaveProfile = async () => {
    if (!currentUser) return

    setSaving(true)
    try {
      const userRef = doc(db, "users", currentUser.uid)
      let finalPhotoURL = photoURL

      // If a new file was selected, compress it now
      const fileInput = fileInputRef.current
      if (fileInput && fileInput.files && fileInput.files[0]) {
        finalPhotoURL = await compressImageToBase64(fileInput.files[0], 400, 0.6)
      }

      await updateDoc(userRef, {
        displayName: name,
        bio: bio,
        photoURL: finalPhotoURL,
        subjects: selectedSubjects,
        "preferences.theme": theme,
      })

      setPhotoURL(finalPhotoURL) // update state with real base64
      toast.success("Profil muvaffaqiyatli saqlandi")
    } catch (error) {
      console.error("Error saving profile:", error)
      toast.error("Saqlashda xatolik yuz berdi")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-7xl grid-cols-12 gap-6 bg-transparent px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      {/* Left Sidebar (Navigation) */}
      <aside className="col-span-12 overflow-y-auto rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-sm md:col-span-3 md:p-6">
        <div className="mb-8 hidden md:block">
          <h1 className="mb-1 text-2xl font-bold text-foreground">Sozlamalar</h1>
          <p className="text-sm text-muted-foreground">Hisobingizni boshqaring</p>
        </div>

        <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-hidden gap-2 pb-2 md:pb-0">
          <button
            onClick={() => setActiveTab("profil")}
            className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-[var(--radius-md)] text-left transition-colors whitespace-nowrap md:whitespace-normal ${activeTab === "profil"
              ? "bg-primary/10 text-primary border border-primary/15"
              : "bg-surface text-slate-700 hover:bg-slate-50 border border-border"
              }`}
          >
            <User className="h-4 w-4 md:h-5 md:w-5" />
            <span className="font-medium text-sm md:text-base">Profil</span>
          </button>

          <button
            onClick={() => setActiveTab("fanlar")}
            className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-[var(--radius-md)] text-left transition-colors whitespace-nowrap md:whitespace-normal ${activeTab === "fanlar"
              ? "bg-primary/10 text-primary border border-primary/15"
              : "bg-surface text-slate-700 hover:bg-slate-50 border border-border"
              }`}
          >
            <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
            <span className="font-medium text-sm md:text-base">Fanlar va Qiziqishlar</span>
          </button>

          <button
            onClick={() => setActiveTab("korinish")}
            className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-[var(--radius-md)] text-left transition-colors whitespace-nowrap md:whitespace-normal ${activeTab === "korinish"
              ? "bg-primary/10 text-primary border border-primary/15"
              : "bg-surface text-slate-700 hover:bg-slate-50 border border-border"
              }`}
          >
            <Palette className="h-4 w-4 md:h-5 md:w-5" />
            <span className="font-medium text-sm md:text-base">Ko'rinish</span>
          </button>

          <button
            onClick={() => setActiveTab("xavfsizlik")}
            className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-[var(--radius-md)] text-left transition-colors whitespace-nowrap md:whitespace-normal ${activeTab === "xavfsizlik"
              ? "bg-primary/10 text-primary border border-primary/15"
              : "bg-surface text-slate-700 hover:bg-slate-50 border border-border"
              }`}
          >
            <Shield className="h-4 w-4 md:h-5 md:w-5" />
            <span className="font-medium text-sm md:text-base">Xavfsizlik</span>
          </button>
        </nav>
      </aside>

      {/* Right Content Area */}
      <main className="col-span-12 overflow-y-auto rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-sm md:col-span-9 md:p-8">
        {/* Profil Tab */}
        {activeTab === "profil" && (
          <div className="max-w-3xl">
            <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">Profil</h2>
            <p className="mb-8 text-sm text-muted-foreground md:text-base">Shaxsiy ma'lumotlaringizni tahrirlang</p>

            {/* Avatar Upload */}
            <div className="mb-6 rounded-[var(--radius-lg)] border border-border bg-slate-50/70 p-4 md:p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                Profil rasmi
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shrink-0 overflow-hidden relative">
                  {photoURL ? (
                    photoURL.startsWith("data:") ? (
                      // base64 previews can't use next/image, use regular img
                      // eslint-disable-next-line @next/next/no-img-element
                      <Image src={photoURL} alt="Profile" width={80} height={80} className="h-full w-full object-cover" unoptimized />
                    ) : (
                      <Image src={photoURL} alt="Profile" fill className="object-cover" sizes="80px" />
                    )
                  ) : (
                    name.charAt(0).toUpperCase() || "F"
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-[var(--radius-md)]"
                  >
                    <Upload className="h-4 w-4" />
                    Rasm tanlash
                  </Button>
                  <p className="text-xs text-slate-500 mt-2">
                    JPG, PNG, WEBP. Maksimal o'lcham 400x400 (avtomatik siqiladi).
                  </p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                To'liq ism
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Bio */}
            <div className="mb-6">
              <label htmlFor="bio" className="block text-sm font-semibold text-slate-700 mb-2">
                Bio
              </label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={500}
                className="resize-none"
                placeholder="O'zingiz haqingizda qisqacha yozing..."
              />
              <p className="text-xs text-slate-500 mt-2 text-right">
                {bio.length} / 500 belgi
              </p>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="rounded-[var(--radius-md)]"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {saving ? "Saqlanmoqda..." : "O'zgarishlarni saqlash"}
            </Button>
          </div>
        )}

        {/* Fanlar Tab */}
        {activeTab === "fanlar" && (
          <div className="max-w-3xl">
            <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">Fanlar va Qiziqishlar</h2>
            <p className="mb-8 text-sm text-muted-foreground md:text-base">O'rganmoqchi bo'lgan fanlaringizni tanlang</p>

            <div className="rounded-[var(--radius-lg)] border border-border bg-slate-50/70 p-4 md:p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                Tanlangan fanlar
              </label>

              {/* Selected Pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedSubjects.map((subject) => (
                  <div
                    key={subject}
                    className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-sm font-medium"
                  >
                    <span>{subject}</span>
                    <button
                      onClick={() => removeSubject(subject)}
                      className="hover:bg-teal-100 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Search Input */}
              <Input
                type="text"
                placeholder="Fan qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-3"
              />

              {/* Dropdown Results */}
              {searchTerm && filteredSubjects.length > 0 && (
                <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto bg-white shadow-sm mb-6">
                  {filteredSubjects.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => addSubject(subject)}
                      className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-teal-50 transition-colors border-b border-slate-100 last:border-b-0"
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              )}

              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="mt-4 rounded-[var(--radius-md)]"
              >
                {saving ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </div>
          </div>
        )}

        {/* Ko'rinish Tab */}
        {activeTab === "korinish" && (
          <div className="max-w-3xl">
            <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">Ko'rinish</h2>
            <p className="mb-8 text-sm text-muted-foreground md:text-base">Interfeys ko'rinishini sozlang</p>

            {/* Font Size */}
            <div className="mb-6 rounded-[var(--radius-lg)] border border-border bg-slate-50/70 p-4 md:p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                Shrift o'lchami
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: "small", label: "Kichik" },
                  { id: "medium", label: "O'rta" },
                  { id: "large", label: "Katta" },
                ].map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setFontSize(size.id)}
                    className={`px-4 py-4 rounded-[var(--radius-md)] border-2 text-sm font-medium transition-colors ${fontSize === size.id
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-slate-300 text-slate-700 hover:border-slate-400 bg-white"
                      }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="mb-6 rounded-[var(--radius-lg)] border border-border bg-slate-50/70 p-4 md:p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                Dizayn mavzusi
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: "light", label: "Yorug'", preview: "bg-white" },
                  { id: "dark", label: "Qorong'i", preview: "bg-slate-900" },
                  { id: "system", label: "Tizim", preview: "bg-gradient-to-br from-white to-slate-900" },
                ].map((themeOption) => (
                  <button
                    key={themeOption.id}
                    onClick={() => setTheme(themeOption.id)}
                    className={`px-4 py-4 md:py-6 rounded-[var(--radius-md)] border-2 transition-colors ${theme === themeOption.id
                      ? "border-teal-500 bg-white shadow-sm"
                      : "border-slate-300 hover:border-slate-400 bg-white"
                      }`}
                  >
                    <div className={`h-12 md:h-16 w-full rounded mb-3 border border-slate-200 ${themeOption.preview}`} />
                    <span className="text-sm font-medium text-slate-700">{themeOption.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="rounded-[var(--radius-md)]"
            >
              Saqlash
            </Button>
          </div>
        )}

        {/* Xavfsizlik Tab */}
        {activeTab === "xavfsizlik" && (
          <div className="max-w-3xl">
            <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">Xavfsizlik</h2>
            <p className="mb-8 text-sm text-muted-foreground md:text-base">Hisobingiz xavfsizligini boshqaring</p>

            {/* Change Password */}
            <div className="mb-6 rounded-[var(--radius-lg)] border border-border bg-slate-50/70 p-4 md:p-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Parolni o'zgartirish</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="new-password" className="block text-sm text-slate-700 mb-2">
                    Yangi parol
                  </label>
                  <Input
                    id="new-password"
                    type="password"
                    value={securityData.newPassword}
                    onChange={(e) =>
                      setSecurityData({ ...securityData, newPassword: e.target.value })
                    }
                  />
                </div>

                <Button className="rounded-[var(--radius-md)]">
                  Parolni yangilash
                </Button>
              </div>
            </div>

            {/* Delete Account */}
            <div className="rounded-[var(--radius-lg)] border border-red-200 bg-red-50 p-4 md:p-6">
              <h3 className="text-sm font-semibold text-red-900 mb-2">Xavfli zona</h3>
              <p className="text-sm text-red-700 mb-4">
                Hisobingizni o'chirsangiz, barcha ma'lumotlaringiz yo'qoladi va bu amal qaytarilmaydi.
              </p>
              <Button variant="destructive" className="w-full rounded-[var(--radius-md)] md:w-auto">
                Hisobni o'chirish
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
