# 🚀 ברוך הבא לפרויקט BEAST Gym!

<div align="center">

![BEAST](https://img.shields.io/badge/BEAST-Gym-06b6d4?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Ready%20to%20Deploy-success?style=for-the-badge)

**מערכת ניהול אימונים ותזונה מתקדמת**

</div>

---

## 🎯 מה יש כאן?

זהו פרויקט **מוכן לפרודקשן** של מערכת ניהול מתקדמת לחדר כושר, כולל:

- ✅ רישום לאימונים
- ✅ תכניות אימון מותאמות אישית
- ✅ מעקב תזונה והתקדמות
- ✅ ניהול משתמשים (Admin, VIP, Kibbutz, BEAST)
- ✅ גרפים ודוחות
- ✅ PWA - מתקין כאפליקציה במובייל
- ✅ Auto-save אוטומטי

---

## 📚 מסמכים חשובים

| מסמך | מה זה | מתי להשתמש |
|------|-------|------------|
| **[README.md](./README.md)** | 📖 תיעוד מלא | קרא ראשון! |
| **[QUICK-DEPLOY.md](./QUICK-DEPLOY.md)** | ⚡ דפלוי מהיר ב-15 דקות | להעלאה מהירה |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | 📋 מדריך דפלוי מפורט | להבנה מעמיקה |
| **[DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)** | ✅ רשימת משימות | במהלך הדפלוי |
| **[ICONS-GUIDE.md](./ICONS-GUIDE.md)** | 🎨 יצירת אייקונים | ליצירת לוגו |

---

## 🚀 מה עושים עכשיו?

### אופציה 1: רוצה להעלות מהר? (15 דקות)

```bash
# קרא את המדריך המהיר
open QUICK-DEPLOY.md
```

### אופציה 2: רוצה להבין לעומק? (30 דקות)

```bash
# קרא את המדריך המפורט
open DEPLOYMENT.md
```

### אופציה 3: רוצה לפתח מקומי קודם?

```bash
# התקן dependencies
cd backend && npm install
cd ../frontend && npm install

# הרץ Backend
cd backend && npm run dev  # Port 3001

# הרץ Frontend (טאב חדש)
cd frontend && npm run dev  # Port 3000
```

גש ל-`http://localhost:3000` 🎉

---

## 🎨 אייקונים

האפליקציה מוכנה לפרודקשן, אבל **חסרים אייקונים מותאמים אישית**.

**יש לך 2 אופציות:**

### 1. השתמש בזמני (מהיר)
האפליקציה כוללת SVG זמני - פשוט המשך לדפלוי!

### 2. צור לוגו מותאם (מומלץ)
ראה [ICONS-GUIDE.md](./ICONS-GUIDE.md) למדריך מלא.

---

## 💰 עלויות

| שירות | עלות |
|-------|------|
| **Fly.io** (Backend + DB) | **חינמי** עד ~100 משתמשים |
| **Vercel** (Frontend) | **חינמי** לנצח |
| **דומיין משלך** (אופציונלי) | ~₪40/שנה |

**סה"כ: 100% חינמי!** 🎉

---

## 🔑 פרטי התחברות ראשוניים

לאחר הדפלוי, תצטרך ליצור משתמש Admin:

- **Email:** `konfinoshlomi@gmail.com`
- **שם:** שלומי קונפינו
- **סיסמה:** [תבחר בעצמך]

---

## 📞 זקוק לעזרה?

### בעיות טכניות?
1. בדוק [DEPLOYMENT.md](./DEPLOYMENT.md) → "בעיות נפוצות"
2. הרץ `flyctl doctor` לבדיקת Fly.io
3. בדוק את ה-logs: `flyctl logs`

### רוצה להוסיף תכונות?
הפרויקט פתוח לשינויים! קרא את [README.md](./README.md) → "תרומה לפרויקט"

### שאלות כלליות?
📧 Email: konfinoshlomi@gmail.com

---

## 🛠️ מבנה הפרויקט

```
GymApp/
├── backend/               # Backend (Node.js + Express + PostgreSQL)
│   ├── src/
│   │   ├── database.ts           # SQLite (Development)
│   │   ├── database-postgres.ts  # PostgreSQL (Production)
│   │   ├── index.ts             # Development server
│   │   └── index-production.ts  # Production server
│   ├── Dockerfile
│   ├── fly.toml
│   └── package.json
│
├── frontend/              # Frontend (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # Context API
│   │   ├── utils/         # Utilities
│   │   └── api.ts         # API client
│   ├── public/
│   │   ├── manifest.json  # PWA manifest
│   │   └── icons/         # אייקונים (צריך להוסיף)
│   └── package.json
│
├── README.md              # תיעוד מלא
├── QUICK-DEPLOY.md        # דפלוי מהיר
├── DEPLOYMENT.md          # דפלוי מפורט
├── DEPLOYMENT-CHECKLIST.md
├── ICONS-GUIDE.md
└── START-HERE.md          # 👈 אתה כאן!
```

---

## ✅ מוכן להתחיל?

בחר את המסלול שלך:

1. **📖 קרא תחילה:** [README.md](./README.md)
2. **⚡ דפלוי מהיר:** [QUICK-DEPLOY.md](./QUICK-DEPLOY.md)
3. **📋 דפלוי מפורט:** [DEPLOYMENT.md](./DEPLOYMENT.md)
4. **🎨 צור אייקונים:** [ICONS-GUIDE.md](./ICONS-GUIDE.md)

---

<div align="center">

**בהצלחה! 🚀💪**

נבנה עם ❤️ עבור BEAST Gym

![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)

</div>
