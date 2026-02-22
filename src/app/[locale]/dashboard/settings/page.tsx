"use client"

import { useState } from "react"
import { User, BookOpen, Palette, Shield, Upload, X } from "lucide-react"

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
  const [activeTab, setActiveTab] = useState<SettingsTab>("profil")
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(["Jinoyat huquqi", "Fuqarolik huquqi"])
  const [searchTerm, setSearchTerm] = useState("")
  const [fontSize, setFontSize] = useState("medium")
  const [theme, setTheme] = useState("light")
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const [profileData, setProfileData] = useState({
    name: "Foydalanuvchi",
    bio: "Men huquqshunosman va chuqur o'rganishni yaxshi ko'raman.",
  })

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

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

  return (
    <div className="grid grid-cols-12 h-screen bg-white">
      {/* Left Sidebar (Navigation) */}
      <aside className="col-span-3 bg-slate-100 border-r border-slate-200 p-6 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Sozlamalar</h1>
          <p className="text-sm text-slate-500">Hisobingizni boshqaring</p>
        </div>

        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("profil")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
              activeTab === "profil"
                ? "bg-teal-600 text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <User className="h-5 w-5" />
            <span className="font-medium">Profil</span>
          </button>

          <button
            onClick={() => setActiveTab("fanlar")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
              activeTab === "fanlar"
                ? "bg-teal-600 text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span className="font-medium">Fanlar va Qiziqishlar</span>
          </button>

          <button
            onClick={() => setActiveTab("korinish")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
              activeTab === "korinish"
                ? "bg-teal-600 text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <Palette className="h-5 w-5" />
            <span className="font-medium">Ko'rinish</span>
          </button>

          <button
            onClick={() => setActiveTab("xavfsizlik")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
              activeTab === "xavfsizlik"
                ? "bg-teal-600 text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <Shield className="h-5 w-5" />
            <span className="font-medium">Xavfsizlik</span>
          </button>
        </nav>
      </aside>

      {/* Right Content Area */}
      <main className="col-span-9 bg-white p-8 overflow-y-auto">
        {/* Profil Tab */}
        {activeTab === "profil" && (
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Profil</h2>
            <p className="text-slate-500 mb-8">Shaxsiy ma'lumotlaringizni tahrirlang</p>

            {/* Avatar Upload */}
            <div className="mb-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                Profil rasmi
              </label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  F
                </div>
                <div>
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
                    <Upload className="h-4 w-4" />
                    Rasm yuklash
                  </button>
                  <p className="text-xs text-slate-500 mt-2">
                    JPG, PNG yoki GIF. Maksimal 2MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                To'liq ism
              </label>
              <input
                id="name"
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full border border-slate-300 rounded-md p-3 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              />
            </div>

            {/* Bio */}
            <div className="mb-6">
              <label htmlFor="bio" className="block text-sm font-semibold text-slate-700 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                rows={4}
                className="w-full border border-slate-300 rounded-md p-3 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all resize-none"
                placeholder="O'zingiz haqingizda qisqacha yozing..."
              />
              <p className="text-xs text-slate-500 mt-2">
                {profileData.bio.length} / 500 belgi
              </p>
            </div>

            <button className="bg-teal-600 text-white px-6 py-3 rounded-md hover:bg-teal-700 font-medium transition-colors">
              O'zgarishlarni saqlash
            </button>
          </div>
        )}

        {/* Fanlar Tab */}
        {activeTab === "fanlar" && (
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Fanlar va Qiziqishlar</h2>
            <p className="text-slate-500 mb-8">O'rganmoqchi bo'lgan fanlaringizni tanlang</p>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                Tanlangan fanlar
              </label>

              {/* Selected Pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedSubjects.map((subject) => (
                  <div
                    key={subject}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-sm font-medium"
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
              <input
                type="text"
                placeholder="Fan qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-3 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all mb-3"
              />

              {/* Dropdown Results */}
              {searchTerm && filteredSubjects.length > 0 && (
                <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto bg-white shadow-sm">
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
            </div>
          </div>
        )}

        {/* Ko'rinish Tab */}
        {activeTab === "korinish" && (
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Ko'rinish</h2>
            <p className="text-slate-500 mb-8">Interfeys ko'rinishini sozlang</p>

            {/* Font Size */}
            <div className="mb-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                Shrift o'lchami
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "small", label: "Kichik" },
                  { id: "medium", label: "O'rta" },
                  { id: "large", label: "Katta" },
                ].map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setFontSize(size.id)}
                    className={`px-4 py-4 rounded-lg border-2 text-sm font-medium transition-all ${
                      fontSize === size.id
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
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                Dizayn mavzusi
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "light", label: "Yorug'", preview: "bg-white" },
                  { id: "dark", label: "Qorong'i", preview: "bg-slate-900" },
                  { id: "system", label: "Tizim", preview: "bg-gradient-to-br from-white to-slate-900" },
                ].map((themeOption) => (
                  <button
                    key={themeOption.id}
                    onClick={() => setTheme(themeOption.id)}
                    className={`px-4 py-6 rounded-lg border-2 transition-all ${
                      theme === themeOption.id
                        ? "border-teal-500 bg-white"
                        : "border-slate-300 hover:border-slate-400 bg-white"
                    }`}
                  >
                    <div className={`h-16 w-full rounded mb-3 border border-slate-200 ${themeOption.preview}`} />
                    <span className="text-sm font-medium text-slate-700">{themeOption.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Xavfsizlik Tab */}
        {activeTab === "xavfsizlik" && (
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Xavfsizlik</h2>
            <p className="text-slate-500 mb-8">Hisobingiz xavfsizligini boshqaring</p>

            {/* 2FA Toggle */}
            <div className="mb-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">
                    Ikki bosqichli autentifikatsiya (2FA)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hisobingizga qo'shimcha xavfsizlik qatlami qo'shing
                  </p>
                </div>
                <button
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    twoFactorEnabled ? "bg-teal-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      twoFactorEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div className="mb-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Parolni o'zgartirish</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="current-password" className="block text-sm text-slate-700 mb-2">
                    Joriy parol
                  </label>
                  <input
                    id="current-password"
                    type="password"
                    value={securityData.currentPassword}
                    onChange={(e) =>
                      setSecurityData({ ...securityData, currentPassword: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-md p-3 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="new-password" className="block text-sm text-slate-700 mb-2">
                    Yangi parol
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={securityData.newPassword}
                    onChange={(e) =>
                      setSecurityData({ ...securityData, newPassword: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-md p-3 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm text-slate-700 mb-2">
                    Parolni tasdiqlang
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={securityData.confirmPassword}
                    onChange={(e) =>
                      setSecurityData({ ...securityData, confirmPassword: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-md p-3 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  />
                </div>

                <button className="bg-teal-600 text-white px-6 py-3 rounded-md hover:bg-teal-700 font-medium transition-colors">
                  Parolni yangilash
                </button>
              </div>
            </div>

            {/* Delete Account */}
            <div className="p-6 bg-red-50 rounded-xl border border-red-200">
              <h3 className="text-sm font-semibold text-red-900 mb-2">Xavfli zona</h3>
              <p className="text-sm text-red-700 mb-4">
                Hisobingizni o'chirsangiz, barcha ma'lumotlaringiz yo'qoladi va bu amal qaytarilmaydi.
              </p>
              <button className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 font-medium transition-colors">
                Hisobni o'chirish
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
