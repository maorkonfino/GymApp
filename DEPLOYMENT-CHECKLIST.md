# ✅ Deployment Checklist

## 📋 לפני שתתחיל

- [ ] יש לך חשבון Fly.io (חינמי)
- [ ] יש לך חשבון Vercel (חינמי)
- [ ] יש לך חשבון GitHub
- [ ] התקנת Fly CLI (`brew install flyctl`)
- [ ] אייקונים מוכנים (או placeholder זמני)

---

## 🔧 Backend Deployment

### 1. יצירת PostgreSQL Database

```bash
cd backend
flyctl auth login
flyctl postgres create --name beast-gym-db --region ams
```

- [ ] שמרתי את ה-Connection String
- [ ] שמרתי את הסיסמה

### 2. פריסת Backend

```bash
flyctl launch --no-deploy
```

- [ ] בחרתי שם אפליקציה ייחודי
- [ ] בחרתי region: Amsterdam (ams)
- [ ] סרבתי ליצירת PostgreSQL (כבר יצרנו)

```bash
flyctl secrets set DATABASE_URL="<CONNECTION_STRING>"
flyctl secrets set ADMIN_EMAIL="konfinoshlomi@gmail.com"
flyctl deploy
```

- [ ] Deploy הצליח
- [ ] Backend URL: `___________________________`

### 3. בדיקת Backend

```bash
curl https://YOUR-APP.fly.dev/api/health
```

- [ ] מחזיר: `{"status":"ok"}`

---

## 🎨 Frontend Deployment

### 1. העלאה לגיטהאב

```bash
cd ..
git init
git add .
git commit -m "Ready for deployment"
# צור repo בגיטהאב
git remote add origin https://github.com/USERNAME/beast-gym.git
git push -u origin main
```

- [ ] קוד עלה לגיטהאב
- [ ] Repository URL: `___________________________`

### 2. פריסה ל-Vercel

1. גש ל-[vercel.com/new](https://vercel.com/new)
2. בחר repository
3. הגדרות:
   - Root Directory: `frontend`
   - Framework: `Vite`
   - Environment Variables:
     - `VITE_API_URL` = `https://YOUR-BACKEND.fly.dev/api`

- [ ] Deploy הצליח
- [ ] Frontend URL: `___________________________`

---

## ⚙️ הגדרות סופיות

### 1. עדכון CORS

```bash
cd backend
flyctl secrets set FRONTEND_URL="https://YOUR-FRONTEND.vercel.app"
flyctl deploy
```

- [ ] CORS מעודכן
- [ ] Deploy חוזר הצליח

### 2. יצירת Admin

1. גש ל-Frontend URL
2. הירשם עם:
   - Email: `konfinoshlomi@gmail.com`
   - שם: שלומי קונפינו
   - טלפון: `_______________`
   - סיסמה: `_______________` (שמור במקום בטוח!)

```bash
flyctl postgres connect -a beast-gym-db
UPDATE users SET role = 'admin' WHERE email = 'konfinoshlomi@gmail.com';
\q
```

- [ ] משתמש Admin נוצר
- [ ] התחברתי בהצלחה

---

## 🧪 בדיקות

### Frontend
- [ ] האתר נטען
- [ ] אפשר להירשם
- [ ] אפשר להתחבר
- [ ] עיצוב נראה טוב במובייל
- [ ] PWA מוצע להתקנה

### Backend
- [ ] API מגיב
- [ ] רישום לאימונים עובד
- [ ] תכניות אימון נשמרות
- [ ] מעקב תזונה עובד

### Admin
- [ ] רואה "רשימת מנויים"
- [ ] יכול לערוך משתמשים
- [ ] יכול ליצור תכנית אימון
- [ ] יכול להגדיר יעדי תזונה

---

## 🎉 סיימתי!

כתובות מעודכנות:

- 🌐 Frontend: `___________________________`
- ⚙️ Backend: `___________________________`
- 📧 Admin Email: `konfinoshlomi@gmail.com`
- 🔑 Admin Password: `_______________`

---

## 📝 הערות

רשום כאן כל בעיה/הערה/שינוי שנתקלת בו:

```
[כאן כותבים הערות]
```

---

## 🔄 לעדכונים עתידיים

### Backend:
```bash
cd backend
# ערוך קוד...
flyctl deploy
```

### Frontend:
```bash
git add .
git commit -m "Update"
git push  # Vercel יפרוס אוטומטית
```

---

**זהו! האפליקציה שלך פעילה! 🚀**

תאריך השלמה: `___/___/___`

