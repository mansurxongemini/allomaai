# ALLOMA AI

ALLOMA AI bu huquqshunos talabalar va amaliyotchilar uchun yaratilgan sun'iy intellektga asoslangan yuridik ta'lim platformasi. Loyiha First Principles yondashuvi, Sokratik muloqot, intervalli takrorlash va RAG qidiruvini bitta mahsulot ichida birlashtiradi. Maqsad faqat qonun matnlarini yodlatish emas, balki foydalanuvchini huquqiy fikrlashga, tahlilga va mustaqil xulosa chiqarishga o'rgatishdir.

Platforma Next.js 15, React 19, Firebase va Google Gemini asosida qurilgan. Foydalanuvchi dashboard orqali o'qiydi, yozadi, AI bilan muloqot qiladi, topshiriqlar bajaradi va bloglar yaratadi. Admin panel orqali esa kontent, foydalanuvchilar, mavzular, metodlar va analitika boshqariladi.

## Asosiy imkoniyatlar

- Huquqiy ta'lim uchun maxsus AI yordamchi
- First Principles asosida mavzularni chuqur tushuntirish
- Sokratik usulda ishlovchi professor rejimi
- RAG asosidagi kontekstli javoblar
- Intervalli takrorlash va vazifalar oqimi
- LAB va Couch ishchi zonalari
- Blog yozish va draft saqlash
- Firebase Authentication orqali kirish
- Admin panel orqali kontent va foydalanuvchilarni boshqarish
- O'zbek, rus va ingliz tillarini qo'llab-quvvatlash

## Batafsil imkoniyatlar

### 1. AI yordamchi va o'quv murabbiyi

- Oddiy yordamchi rejimi foydalanuvchiga huquqiy savollarni sodda va tez tushuntiradi.
- Professor rejimi tayyor javob berish o'rniga foydalanuvchini savollar orqali fikrlashga undaydi.
- Chat oqimi RAG bilan boyitilgan: savol bo'yicha Firestore vector bazadan eng yaqin huquqiy manbalar topiladi.
- AI javoblari uzunligi boshqariladi: qisqa, standart yoki batafsil javob formatlari ishlatiladi.
- Chat interfeysi markdown, ro'yxatlar, iqtiboslar va citation pill ko'rinishida kontekst raqamlarini chiqaradi.
- Foydalanuvchi sessiyalari Firestore'da saqlanadi, eski chatlarni davom ettirish va o'chirish mumkin.
- AI javob ichida alohida murabbiy maslahati bloklari ham ko'rsatiladi.

### 2. Dashboard va shaxsiy progress

- Bosh sahifa foydalanuvchining asosiy holatini bitta joyda ko'rsatadi.
- Profil blokida daraja, jami ball, streak va umumiy o'quv aktivligi ko'rinadi.
- Haftalik activity chart foydalanuvchining oxirgi kunlardagi faolligi va ball yig'ishini vizual ko'rsatadi.
- Dashboard real vaqtga yaqin Firestore listenerlar bilan ishlaydi, shuning uchun o'zgarishlar avtomatik aks etadi.
- Tizim leaderboard mantig'ini qo'llaydi va top foydalanuvchilarni ballar bo'yicha solishtirishga tayyor infratuzilmaga ega.

### 3. Vazifalar va Spaced Repetition

- Foydalanuvchi yangi vazifani modal orqali yaratadi.
- Vazifa turi ikki xil: bir martalik yoki intervalli takrorlash uchun mo'ljallangan vazifa.
- Intervalli vazifalarda avtomatik takrorlash jadvali mavjud: `1-kun -> 3-kun -> 7-kun -> 15-kun -> 30-kun`.
- Vazifaga sarlavha, ikonka va izoh biriktirish mumkin.
- Tizim bugungi, kelgusi va jami vazifalarni alohida ko'rsatadi.
- Vazifa bajarilganda gamification tizimi ishga tushadi va foydalanuvchiga ball yoziladi.
- Bir martalik vazifa yakunlanganda `tasksCompleted` statistikasi oshadi, spaced vazifalarda esa review sessiya sifatida qayd qilinadi.

### 4. Gamification va motivatsiya

- Har bir foydalanuvchida `totalPoints` yig'iladi.
- Darajalar tizimi mavjud: `Yangi talaba`, `Tinglovchi`, `Tadqiqotchi`, `Tahlilchi`, `Mutaxassis`, `Ustoz`, `Alloma`.
- Daily streak va longest streak alohida saqlanadi.
- Tizim foydalanuvchi faoliyatidan keyin kunlik seriyani avtomatik yangilaydi.
- Badge tizimi uchun tayyor mantiq mavjud: maqola yuborish, vazifa bajarish, streak saqlash va boshqa milestone'lar kuzatiladi.
- Activity log kolleksiyasi orqali kunlik ball va taxminiy o'qish minutlari agregatsiya qilinadi.

### 5. LAB moduli

- LAB bo'limi o'quv kontentini uch asosiy yo'nalikka ajratadi: fanlar, metodlar va maqolalar.
- Fanlar bo'limi huquqiy yo'nalishlar bo'yicha o'quv materiallari va mashqlarni jamlaydi.
- Metodlar bo'limida o'qish strategiyalari va learning science elementlari beriladi.
- Maqolalar bo'limi hamjamiyat yoki foydalanuvchi tomonidan yaratilgan yozuvlarni bir joyga to'playdi.
- LAB bosh sahifasida Firestore'dan olinadigan live count lar chiqariladi.

### 6. Blog va yozish oqimi

- Foydalanuvchi dashboard ichida blog yozishi va draft saqlashi mumkin.
- Bloglar Firestore'da saqlanadi va keyin o'qish yoki tahrirlash uchun qayta ochiladi.
- Blog yozish oqimi foydalanuvchining fikrni tuzish, huquqiy argument yozish va kontent ishlab chiqish jarayoniga moslangan.

### 7. O'quv kontenti boshqaruvi

- `subjects` kolleksiyasi orqali fanlar saqlanadi.
- Har bir fan ichida `topics` subcollection bor.
- `methods` kolleksiyasi orqali o'rganish metodlari yuritiladi.
- Har bir metod uchun ham alohida topiclar biriktiriladi.
- `cases`, `articles`, `blogs`, `laws` kabi manbalar AI va admin oqimiga ulanadi.
- Mindmap yoki boshqa materiallarni Firebase Storage'ga yuklash uchun servis qatlam tayyorlangan.

### 8. Analitika va zaifliklar radari

- Tizim foydalanuvchi profili ichida `profile.weaknesses` maydonini yuritadi.
- AI yoki tahlil oqimi aniqlagan zaif mavzular foydalanuvchi dosyesiga qo'shiladi.
- Admin analytics sahifasi barcha talabalar bo'yicha umumiy weakness trendlarni yig'adi.
- Dekanat uchun eng qiyin mavzu, tahlil qilingan talabalar soni va o'rtacha xatolar soni ko'rsatiladi.
- Qiyin mavzular bar-chart ko'rinishida chiqariladi.

### 9. Admin boshqaruv paneli

- Adminlar foydalanuvchilar ro'yxatini ko'rishi va tizimdagi umumiy faollikni kuzatishi mumkin.
- Fanlar va metodlar CRUD oqimi orqali boshqariladi.
- Bloglar, articles va cases kontenti alohida bo'limlarda yuritiladi.
- Notifications va support bo'limlari orqali ichki operatsion oqimlarni tashkil qilish mumkin.
- Vector sync endpoint orqali yangi yoki yangilangan hujjatlar AI bilim bazasiga yuboriladi.

### 10. Ko'p tillilik va UX

- Platforma `uz`, `ru`, `en` lokalelar bilan ishlaydi.
- Default til o'zbek tili hisoblanadi.
- Landing page, auth va umumiy navigatsiya tarjima fayllari orqali boshqariladi.
- Dashboard va sayt mobil qurilmalarga mos UI bilan ishlaydi.
- Komponentlar bazasi Radix UI va custom design system kombinatsiyasiga tayangan.

## Mahsulot modullari

### Landing page

Saytning ochiq qismi quyidagi mahsulot g'oyalarini ko'rsatadi:

- First Principles asosida huquqni o'rganish
- AI yordamida dinamik mind map va tahlil
- LAB va Couch orqali yozish va murabbiylik jarayoni
- Spaced Repetition orqali uzoq muddatli eslab qolish
- Narxlar, FAQ va mahsulot afzalliklari

### Foydalanuvchi dashboard

Dashboard menyusida quyidagi bo'limlar mavjud:

- Bosh sahifa
- Vazifalar
- LAB
- Couch
- Bloglar
- Murojaatlar
- Sozlamalar

Bu oqim foydalanuvchiga kundalik o'qish, yozish, AI bilan maslahatlashish va bilimni mustahkamlashni yagona joyda boshqarish imkonini beradi.

### AI chat tizimi

Chat API ikki xil muloqot rejimini qo'llaydi:

- `personal`: do'stona, tezkor, tushunarli AI yordamchi
- `professor`: qattiqroq, Sokratik savollar orqali o'ylashga undovchi professor rejimi

Chat javoblari Firestore ichidagi `vector_memory` kolleksiyasidan olinadigan semantik kontekst bilan boyitiladi. Agar kontekst topilsa, model shu ma'lumotlar asosida javob qaytaradi. Bu yondashuv javoblarning aniqligini oshiradi va huquqiy kontentga yaqinlashtiradi.

### Admin panel

Admin qismi quyidagi bo'limlarni o'z ichiga oladi:

- Analytics
- Users
- Subjects
- Methods
- Articles
- Blogs
- Cases
- Notifications
- Support

Adminlar o'quv kontentini boshqarishi, mavzu va metodlar yaratishi, foydalanuvchilarni ko'rishi va AI uchun bilim bazasini yangilashi mumkin.

## Texnologik stack

### Frontend

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI
- Framer Motion
- next-intl

### Backend va platforma

- Next.js Route Handlers
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Admin SDK

### AI qatlami

- Vercel AI SDK
- Google Generative AI
- `gemini-3.1-flash-lite-preview`
- Embedding modeli orqali vector search
- Firestore native vector index

## Ko'p tillilik

Loyiha quyidagi tillarni qo'llab-quvvatlaydi:

- `uz` - asosiy til
- `ru`
- `en`

Routing `next-intl` orqali boshqariladi va default locale sifatida `uz` ishlatiladi.

## Arxitektura qisqacha

1. Foydalanuvchi Firebase orqali tizimga kiradi.
2. Middleware himoyalangan dashboard marshrutlariga token asosida kirishni tekshiradi.
3. Dashboard ichida foydalanuvchi chat, vazifa, blog va boshqa modullar bilan ishlaydi.
4. Chat API foydalanuvchi savolidan embedding hosil qiladi.
5. Embedding orqali Firestore `vector_memory` kolleksiyasidan eng yaqin kontekst topiladi.
6. Gemini modeli topilgan kontekst bilan javob generatsiya qiladi.
7. Admin panel kerakli kontentni yangilaydi va alohida sync route orqali yangi hujjatlarni vector bazaga yuboradi.

## Papkalar tuzilmasi

```text
src/
  app/
    [locale]/
      (site)/           # Landing page va ochiq sahifalar
      dashboard/        # Foydalanuvchi kabineti
      admin/            # Admin panel
    api/
      chat/             # AI chat endpoint
      admin/
        sync-vectors/   # Vector bazani yangilash endpointi
  components/           # UI va sahifa komponentlari
  context/              # Auth va global contextlar
  hooks/                # Maxsus React hooklar
  i18n/                 # Lokalizatsiya routing va config
  lib/                  # Firebase, AI model, util funksiyalar
  services/             # Firestore, analytics, vector service
  types/                # TypeScript turlari
messages/               # Tarjima fayllari
public/                 # Statik assetlar
```

## O'rnatish

### Talablar

- Node.js 20 yoki undan yuqori
- npm
- Firebase loyihasi
- Google Generative AI API key

### 1. Dependencies o'rnatish

```bash
npm install
```

### 2. Muhit o'zgaruvchilarini sozlash

Loyiha ildizida `.env.local` fayl yarating va quyidagi qiymatlarni kiriting:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

GOOGLE_GENERATIVE_AI_API_KEY=
ADMIN_SYNC_SECRET=

NEXT_PUBLIC_PRO_MONTHLY_PRICE_ID=
NEXT_PUBLIC_PRO_YEARLY_PRICE_ID=
```

### 3. Development server ishga tushirish

```bash
npm run dev
```

Brauzerda quyidagi manzilni oching:

```text
http://localhost:3000
```

## Muhit o'zgaruvchilari izohi

| O'zgaruvchi | Vazifasi |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase client SDK uchun API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firestore loyihasi ID si |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket nomi |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app identifikatori |
| `FIREBASE_ADMIN_PROJECT_ID` | Server tomondagi Firebase Admin project ID |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Firebase Admin service account email |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Firebase Admin private key, `\n` bilan saqlanadi |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini model va embeddinglar uchun API key |
| `ADMIN_SYNC_SECRET` | Admin vector sync endpoint himoyasi |
| `NEXT_PUBLIC_PRO_MONTHLY_PRICE_ID` | Pro tarif oylik narx ID si |
| `NEXT_PUBLIC_PRO_YEARLY_PRICE_ID` | Pro tarif yillik narx ID si |

## Mavjud skriptlar

```bash
npm run dev
npm run build
npm run start
npm run lint
```

Qo'shimcha skriptlar:

```bash
npm run db:push
npm run db:generate
npm run db:migrate
npm run stripe:listen
```

Eslatma: repo hozir Firebase bilan faol ishlaydi. `db:*` skriptlari package ichida mavjud bo'lsa ham, ular joriy amaliy oqimning asosiy qismi emas.

## Vector sync qanday ishlaydi

Admin endpoint quyidagi kolleksiyalarni ko'rib chiqadi:

- `articles`
- `blogs`
- `cases`
- `laws`
- `subjects/*/topics`
- `methods/*/topics`

`vectorized !== true` bo'lgan hujjatlar embedding qilinadi va `vector_memory` kolleksiyasiga yoziladi. Shundan keyin AI chat shu bilim bazadan foydalanadi.

PowerShell orqali endpointni chaqirish namunasi:

```powershell
curl -X POST "http://localhost:3000/api/admin/sync-vectors" -H "Authorization: Bearer YOUR_ADMIN_SYNC_SECRET"
```

## Xavfsizlik va kirish nazorati

- Dashboard marshrutlari middleware orqali himoyalangan
- Auth token cookie orqali tekshiriladi
- Admin endpoint secret header bilan himoyalangan
- Firebase Admin SDK faqat server tomonda ishlatiladi
- Chat API noto'g'ri API key, quota va model xatolarini alohida qaytaradi

## Ma'lumotlar manbalari

Platforma quyidagi tipdagi kontent bilan ishlaydi:

- Fanlar va mavzular
- Metodlar va ularning topiclari
- Cases
- Articles
- Blogs
- User profile va progress
- Support murojaatlari
- Notifications

## Tavsiya etiladigan deploy muhiti

- Vercel frontend va serverless route lar uchun
- Firebase Firestore va Storage ma'lumotlar qatlami uchun

Deploy qilishdan oldin barcha environment variable lar to'g'ri kiritilganiga va Firestore indexlar sozlanganiga ishonch hosil qiling.

## AllomaAI nimani hal qiladi

An'anaviy yondashuvda yuridik ta'lim ko'pincha katta hajmdagi matnlarni yodlashga tayanadi. ALLOMA AI bu muammoni quyidagi yo'l bilan yechadi:

- bilimni strukturaga soladi
- AI orqali interaktiv fikrlashni rag'batlantiradi
- foydalanuvchini passiv yodlovchidan faol tahlilchiga aylantiradi
- o'rganilgan ma'lumotni intervalli takrorlash bilan mustahkamlaydi

## Status

Loyiha faol rivojlantirilayotgan mahsulot ko'rinishida. Repo ichida landing page, dashboard, admin panel, Firebase integratsiyasi va RAG asosidagi AI chat oqimi mavjud.

## License

Ushbu loyiha [MIT](LICENSE) litsenziyasi asosida tarqatiladi.