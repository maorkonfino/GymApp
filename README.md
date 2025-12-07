# 💪 BEAST Gym - מערכת ניהול אימונים ותזונה

<div align="center">

![BEAST Logo](https://img.shields.io/badge/BEAST-Gym-06b6d4?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**מערכת מתקדמת לניהול אימונים, מעקב תזונה והתקדמות אישית**

[Demo](#) • [Deployment Guide](./DEPLOYMENT.md) • [Quick Start](./QUICK-DEPLOY.md)

</div>

---

## 🌟 תכונות עיקריות

### 👤 למתאמנים
- ✅ **רישום לאימונים** - מערכת רישום גמישה עם בחירת שעות (15 דקות)
- 📅 **תצוגה שבועית** - ראה את כל האימונים השבועיים במבט אחד
- 🏋️ **תכנית אימון אישית** - תכנית מותאמת אישית עם מעקב התקדמות
- 🥗 **מעקב תזונה** - רישום יומי של משקל, קלוריות, מקרו-נוטריאנטים וצעדים
- 📊 **גרפים וממוצעים** - מעקב ויזואלי אחר ההתקדמות
- ⚡ **PWA Support** - התקנה כאפליקציה במובייל

### 👨‍💼 למנהלים
- 📋 **ניהול משתמשים** - רשימת מנויים מלאה עם אפשרויות עריכה
- 🎯 **תכניות אימון** - יצירה ועריכה של תכניות אימון מותאמות אישית
- 🍽️ **יעדי תזונה** - הגדרת יעדים תזונתיים ליום רגיל ויום העמסה
- 👀 **צפייה בכל הרישומים** - מעקב מלא אחר כל האימונים והמתאמנים
- 🔐 **ניהול הרשאות** - מנהל, VIP, קיבוץ, BEAST

---

## 🏗️ טכנולוגיות

### Frontend
- ⚛️ **React 18** + **TypeScript**
- ⚡ **Vite** - Build tool מהיר
- 🎨 **Tailwind CSS** - עיצוב מודרני ורספונסיבי
- 📊 **Chart.js** - גרפים ויזואליים
- 🌐 **Axios** - HTTP requests
- 📱 **PWA** - Progressive Web App

### Backend
- 🟢 **Node.js** + **Express**
- 🔷 **TypeScript** - Type safety
- 🐘 **PostgreSQL** - Database (production)
- 🔒 **bcrypt** - Password hashing
- 🌍 **CORS** - Cross-origin support

### Deployment
- ☁️ **Vercel** - Frontend hosting (חינמי)
- 🚀 **Fly.io** - Backend + PostgreSQL (חינמי עד 100 משתמשים)
- 🔄 **Git** - Version control

---

## 📦 התקנה מקומית

### דרישות מקדימות
- Node.js 18+ 
- npm או yarn

### שלב 1: Clone הפרויקט
```bash
git clone https://github.com/YOUR-USERNAME/beast-gym.git
cd beast-gym
```

### שלב 2: Backend Setup
```bash
cd backend

# התקן dependencies
npm install

# צור קובץ .env
cat > .env << EOF
NODE_ENV=development
PORT=3001
DATABASE_URL=
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=konfinoshlomi@gmail.com
EOF

# הרץ את הבאקאנד
npm run dev
```

### שלב 3: Frontend Setup
```bash
cd ../frontend

# התקן dependencies
npm install

# צור קובץ .env
cat > .env << EOF
VITE_API_URL=http://localhost:3001/api
EOF

# הרץ את הפרונט
npm run dev
```

### שלב 4: פתח בדפדפן
```
Frontend: http://localhost:3000
Backend: http://localhost:3001
API Health: http://localhost:3001/api/health
```

---

## 🚀 Deployment לפרודקשן

### אופציה 1: Quick Deploy (15 דקות)
ראה [QUICK-DEPLOY.md](./QUICK-DEPLOY.md)

### אופציה 2: מדריך מפורט
ראה [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 📱 PWA - התקנה כאפליקציה

### iPhone (iOS)
1. פתח בדפדפן Safari
2. לחץ על כפתור "שיתוף" (ריבוע עם חץ למעלה)
3. גלול למטה ובחר "הוסף למסך הבית"
4. לחץ "הוסף"

### Android
1. פתח בדפדפן Chrome
2. לחץ על ⋮ (שלוש נקודות)
3. בחר "התקן אפליקציה" או "הוסף למסך הבית"
4. לחץ "התקן"

---

## 👥 סוגי משתמשים

| סוג | הרשאות |
|-----|--------|
| **מנהל (Admin)** | גישה מלאה - ניהול משתמשים, תכניות, ורישומים |
| **BEAST** | גישה לכל התכונות כולל תכנית אימון ותזונה מותאמת |
| **קיבוץ (Kibbutz)** | רישום לאימונים וצפייה ברשימות בלבד |
| **VIP** | כמו BEAST עם תכונות נוספות (לעתיד) |

---

## 🎨 צילומי מסך

<div align="center">

### 📅 תצוגה שבועית
![Weekly View](./screenshots/weekly-view.png)

### 🏋️ תכנית אימון
![Workout Plan](./screenshots/workout-plan.png)

### 🥗 מעקב תזונה
![Nutrition Tracking](./screenshots/nutrition.png)

</div>

---

## 🔒 אבטחה

- ✅ סיסמאות מוצפנות ב-bcrypt
- ✅ HTTPS בפרודקשן
- ✅ Environment variables לנתונים רגישים
- ✅ CORS מוגבל לדומיין הפרונט בלבד
- ✅ SQL Injection protection עם Parameterized queries

---

## 💰 עלויות

| שירות | חינמי עד | עלות נוספת |
|-------|----------|------------|
| Vercel | Unlimited | $20/חודש (Pro) |
| Fly.io | 3 VMs, 3GB Storage | ~$5/חודש ל-100+ משתמשים |
| PostgreSQL | 3GB | $0.15/GB/חודש |

**סה"כ עבור ~100 משתמשים: 100% חינמי!** 🎉

---

## 📈 Roadmap

### ✅ כבר פועל
- [x] מערכת רישום לאימונים
- [x] תכניות אימון אישיות
- [x] מעקב תזונה יומי
- [x] גרפים ודוחות
- [x] ניהול משתמשים
- [x] PWA Support
- [x] Auto-save

### 🔜 בקרוב
- [ ] תזכורות אוטומטיות (Email/SMS)
- [ ] אפליקציה Native (React Native)
- [ ] מערכת תשלומים
- [ ] תוכן וידאו
- [ ] מעקב צילומי התקדמות
- [ ] קבוצות אימון

---

## 🤝 תרומה לפרויקט

רוצה לתרום? מעולה!

1. Fork הפרויקט
2. צור branch חדש (`git checkout -b feature/AmazingFeature`)
3. Commit השינויים (`git commit -m 'Add some AmazingFeature'`)
4. Push ל-branch (`git push origin feature/AmazingFeature`)
5. פתח Pull Request

---

## 📞 יצירת קשר

**Shlomi Konfino**  
📧 Email: konfinoshlomi@gmail.com  
🌐 Website: [beastgym.com](#)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**נבנה עם ❤️ על ידי צוות BEAST**

![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

[⬆ חזרה למעלה](#-beast-gym---מערכת-ניהול-אימונים-ותזונה)

</div>
