# دليل التثبيت والتشغيل
## Seerah Comprehensive Interactive Map

---

## 📋 المتطلبات الأساسية

### 1. البرمجيات المطلوبة

- **Node.js**: الإصدار 18.0 أو أحدث
- **npm** أو **yarn** أو **pnpm**
- **Git**: لاستنساخ المشروع

### 2. التحقق من التثبيت

```bash
node --version  # يجب أن يكون >= 18.0
npm --version   # أي إصدار حديث
git --version   # أي إصدار
```

---

## 🚀 التثبيت السريع

### الخطوة 1: استنساخ المشروع

```bash
git clone https://github.com/your-username/seerah-mindmap.git
cd seerah-mindmap
```

### الخطوة 2: تثبيت الاعتماديات

```bash
# باستخدام npm
npm install

# أو باستخدام yarn
yarn install

# أو باستخدام pnpm
pnpm install
```

### الخطوة 3: تشغيل التطبيق

```bash
# وضع التطوير
npm run dev

# أو
yarn dev

# أو
pnpm dev
```

### الخطوة 4: فتح المتصفح

افتح المتصفح على: `http://localhost:3000`

---

## 📦 البناء للإنتاج

### بناء التطبيق

```bash
npm run build
```

### تشغيل النسخة المبنية

```bash
npm run start
```

### التصدير لـ GitHub Pages

```bash
npm run export
```

---

## 🗂️ هيكل المشروع

```
seerah-mindmap/
├── README.md                 # الوثائق الرئيسية (السيرة الكاملة)
├── INSTALLATION.md           # هذا الملف
├── CONTRIBUTING.md           # دليل المساهمة
├── LICENSE                   # رخصة MIT
├── PROJECT_REPORT.md         # تقرير المشروع
│
├── data/                     # ملفات البيانات
│   ├── nodes.json           # الأحداث (1500 حدث)
│   ├── nodes.yaml           # نفس البيانات بصيغة YAML
│   ├── timeline.json        # الخط الزمني
│   ├── relationships.json   # العلاقات بين الأحداث
│   └── people.json          # الشخصيات
│
├── app/                      # تطبيق Next.js
│   ├── layout.tsx           # التخطيط الرئيسي
│   ├── page.tsx             # الصفحة الرئيسية
│   ├── components/          # المكونات
│   │   ├── Map.tsx         # خريطة السيرة
│   │   ├── Search.tsx      # البحث
│   │   ├── Filter.tsx      # الفلترة
│   │   └── Timeline.tsx    # الخط الزمني
│   └── styles/             # الأنماط
│
├── scripts/                 # السكريبتات
│   ├── validate_data.ts    # التحقق من البيانات
│   ├── export_png.js       # تصدير PNG
│   └── generate_summary_pdf.py  # تصدير PDF
│
├── svg/                     # الرسوم البيانية
│   ├── seerah_all.svg      # الخريطة الكاملة
│   ├── pre_bi3tha.svg      # ما قبل البعثة
│   ├── pre_wahi.svg        # ما قبل الوحي
│   ├── post_wahi.svg       # بعد الوحي
│   ├── timeline.svg        # الخط الزمني
│   └── legend.svg          # المفتاح
│
├── public/                  # الملفات العامة
│   ├── fonts/              # الخطوط (Cairo)
│   └── images/             # الصور
│
├── package.json            # اعتماديات Node.js
├── tsconfig.json           # إعدادات TypeScript
├── tailwind.config.js      # إعدادات Tailwind
└── next.config.js          # إعدادات Next.js
```

---

## 🔧 الإعدادات

### 1. إعدادات Next.js

ملف `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // للتصدير الثابت
  images: {
    unoptimized: true
  },
  // دعم RTL
  i18n: {
    locales: ['ar'],
    defaultLocale: 'ar',
  },
}

module.exports = nextConfig
```

### 2. إعدادات Tailwind

ملف `tailwind.config.js`:

```javascript
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### 3. إعدادات TypeScript

ملف `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 🧪 الاختبارات

### تشغيل الاختبارات

```bash
npm run test
```

### التحقق من البيانات

```bash
npm run validate
```

### فحص الأداء

```bash
npm run lighthouse
```

---

## 📊 الأداء

### المعايير المطلوبة

- ⚡ **التحميل**: أقل من 3 ثوانٍ
- 🔍 **البحث**: أقل من 0.3 ثانية
- 📱 **الاستجابة**: 100% responsive
- ♿ **الوصول**: WCAG 2.1 AA

### التحسينات

1. **Code Splitting**: تقسيم الكود
2. **Lazy Loading**: التحميل الكسول
3. **Caching**: التخزين المؤقت
4. **Compression**: الضغط

---

## 🌐 النشر

### GitHub Pages

```bash
# بناء وتصدير
npm run build
npm run export

# نشر
git add out/
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

### Vercel

```bash
# تثبيت Vercel CLI
npm i -g vercel

# نشر
vercel
```

### Netlify

```bash
# بناء
npm run build

# رفع مجلد out/
```

---

## 🐛 حل المشاكل

### المشكلة: خطأ في التثبيت

```bash
# حذف node_modules
rm -rf node_modules package-lock.json

# إعادة التثبيت
npm install
```

### المشكلة: خطأ في البناء

```bash
# تنظيف الكاش
npm run clean

# إعادة البناء
npm run build
```

### المشكلة: الخط لا يظهر

تأكد من وجود خط Cairo في `public/fonts/`

---

## 📞 الدعم

- **Issues**: https://github.com/your-username/seerah-mindmap/issues
- **Discussions**: https://github.com/your-username/seerah-mindmap/discussions
- **Email**: support@seerah-map.com

---

## 📝 الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

---

**تم بحمد الله**

