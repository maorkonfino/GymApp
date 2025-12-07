# 🚀 הוראות Deployment - BEAST Gym App

מדריך מפורט לפריסת האפליקציה ל-production עם **Vercel** (Frontend) ו-**Fly.io** (Backend + PostgreSQL).

---

## 📋 תוכן עניינים

1. [דרישות מקדימות](#דרישות-מקדימות)
2. [Part 1: הקמת PostgreSQL ב-Fly.io](#part-1-הקמת-postgresql-ב-flyio)
3. [Part 2: פריסת Backend ל-Fly.io](#part-2-פריסת-backend-ל-flyio)
4. [Part 3: פריסת Frontend ל-Vercel](#part-3-פריסת-frontend-ל-vercel)
5. [Part 4: הגדרות סופיות](#part-4-הגדרות-סופיות)
6. [בעיות נפוצות ופתרונות](#בעיות-נפוצות-ופתרונות)
7. [עדכונים עתידיים](#עדכונים-עתידיים)

---

## 🎯 דרישות מקדימות

לפני שמתחילים, וודא שיש לך:

### 1. חשבונות (חינמיים)
- ✅ **Fly.io** - [הירשם כאן](https://fly.io/app/sign-up)
- ✅ **Vercel** - [הירשם כאן](https://vercel.com/signup)
- ✅ **GitHub** - [הירשם כאן](https://github.com/signup)

### 2. התקנות נדרשות
```bash
# התקן Fly.io CLI
# macOS
brew install flyctl

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Linux
curl -L https://fly.io/install.sh | sh

# בדוק התקנה
flyctl version
```

### 3. התחברות לחשבונות
```bash
# התחבר ל-Fly.io
flyctl auth login

# התחבר ל-Vercel (יפתח דפדפן)
npx vercel login
```

---

## 📦 Part 1: הקמת PostgreSQL ב-Fly.io

### שלב 1: יצירת PostgreSQL Database

```bash
# עבור לתיקיית הפרויקט
cd /Users/maorko/Development/GymApp/backend

# צור PostgreSQL database
flyctl postgres create --name beast-gym-db --region ams

# שים לב! שמור את פרטי ההתחברות שיוצגו:
# - Username
# - Password  
# - Hostname
# - Database name
# - Connection string
```

**דוגמה לפלט:**
```
Username:    postgres
Password:    <PASSWORD>
Hostname:    beast-gym-db.internal
Database:    beast_gym
Connection string: postgres://postgres:<PASSWORD>@beast-gym-db.internal:5432/beast_gym?sslmode=disable
```

⚠️ **חשוב מאוד:** שמור את ה-Connection String במקום בטוח! תצטרך אותו בשלב הבא.

---

## 🔧 Part 2: פריסת Backend ל-Fly.io

### שלב 1: הכנת הקוד

```bash
cd /Users/maorko/Development/GymApp/backend

# בדוק שהקבצים הבאים קיימים:
# ✓ Dockerfile
# ✓ fly.toml
# ✓ src/database-postgres.ts
# ✓ src/index-production.ts
```

### שלב 2: עדכן fly.toml

ערוך את `fly.toml` ושנה את שם האפליקציה:

```toml
app = "beast-gym-backend"  # שנה לשם ייחודי משלך
primary_region = "ams"     # Amsterdam - קרוב לישראל
```

### שלב 3: צור את האפליקציה

```bash
# צור אפליקציה ב-Fly.io
flyctl launch --no-deploy

# ענה על השאלות:
# ? Choose an app name: beast-gym-backend (או שם אחר)
# ? Choose a region: ams (Amsterdam)
# ? Would you like to set up a Postgresql database? No (כבר עשינו)
# ? Would you like to deploy now? No
```

### שלב 4: הגדר Environment Variables

```bash
# הגדר את ה-DATABASE_URL
flyctl secrets set DATABASE_URL="postgres://postgres:<PASSWORD>@beast-gym-db.internal:5432/beast_gym?sslmode=disable"

# הגדר משתני סביבה נוספים
flyctl secrets set ADMIN_EMAIL="konfinoshlomi@gmail.com"
flyctl secrets set FRONTEND_URL="https://your-app.vercel.app"

# בדוק שהכל הוגדר
flyctl secrets list
```

### שלב 5: Deploy!

```bash
# בנה ופרוס את הקוד
flyctl deploy

# המתן כ-2-3 דקות...
# בסוף תראה:
# ✓ Deployment successful!
# Visit your app at: https://beast-gym-backend.fly.dev
```

### שלב 6: בדוק שהכל עובד

```bash
# בדוק health check
curl https://beast-gym-backend.fly.dev/api/health

# אמור להחזיר:
# {"status":"ok","message":"Server is running"}
```

✅ **Backend מוכן!** שמור את ה-URL: `https://beast-gym-backend.fly.dev`

---

## 🎨 Part 3: פריסת Frontend ל-Vercel

### שלב 1: העלה לגיטהאב

```bash
cd /Users/maorko/Development/GymApp

# אתחל Git (אם עדיין לא)
git init
git add .
git commit -m "Initial commit - Ready for deployment"

# צור repository חדש בגיטהאב ולאחר מכן:
git remote add origin https://github.com/YOUR-USERNAME/beast-gym.git
git push -u origin main
```

### שלב 2: פרוס ל-Vercel

1. **היכנס ל-[Vercel Dashboard](https://vercel.com/dashboard)**

2. **לחץ על "Add New Project"**

3. **בחר את ה-Repository מגיטהאב**

4. **הגדר את הפרויקט:**
   - **Project Name:** `beast-gym`
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. **הוסף Environment Variables:**
   
   לחץ על "Environment Variables" והוסף:
   
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://beast-gym-backend.fly.dev/api` |

6. **לחץ על "Deploy"**

   המתן כ-2-3 דקות...

7. **Frontend מוכן!** תקבל URL כמו: `https://beast-gym.vercel.app`

---

## ⚙️ Part 4: הגדרות סופיות

### 1. עדכן CORS ב-Backend

חזור לטרמינל ועדכן את ה-FRONTEND_URL:

```bash
cd /Users/maorko/Development/GymApp/backend

# עדכן את ה-FRONTEND_URL עם ה-URL האמיתי של Vercel
flyctl secrets set FRONTEND_URL="https://beast-gym.vercel.app"

# פרוס מחדש
flyctl deploy
```

### 2. צור משתמש Admin ראשון

גש ל-`https://beast-gym.vercel.app` ורשום משתמש עם:
- **Email:** `konfinoshlomi@gmail.com`
- **שם:** שלומי קונפינו
- **טלפון:** מספר הטלפון שלך
- **סיסמה:** בחר סיסמה חזקה

אחרי ההרשמה, עדכן את המשתמש ל-Admin:

```bash
# התחבר לדטהבייס
flyctl postgres connect -a beast-gym-db

# בתוך ה-PostgreSQL prompt:
UPDATE users SET role = 'admin' WHERE email = 'konfinoshlomi@gmail.com';
\q
```

---

## 🎉 סיימת! האפליקציה פעילה!

✅ **Frontend:** https://beast-gym.vercel.app  
✅ **Backend:** https://beast-gym-backend.fly.dev  
✅ **Database:** PostgreSQL ב-Fly.io

---

## 🐛 בעיות נפוצות ופתרונות

### Backend לא עולה

```bash
# בדוק לוגים
flyctl logs

# בדוק שהדטהבייס מחובר
flyctl postgres connect -a beast-gym-db
\dt  # הצג טבלאות
\q
```

### Frontend לא מתחבר ל-Backend

1. בדוק שה-`VITE_API_URL` הוגדר נכון ב-Vercel
2. עדכן את ה-`FRONTEND_URL` ב-Backend secrets
3. פרוס מחדש את ה-Backend

### CORS Errors

```bash
# עדכן את FRONTEND_URL
flyctl secrets set FRONTEND_URL="https://beast-gym.vercel.app"
flyctl deploy
```

---

## 🔄 עדכונים עתידיים

### עדכון Backend

```bash
cd /Users/maorko/Development/GymApp/backend

# ערוך קוד
# ...

# פרוס
flyctl deploy
```

### עדכון Frontend

```bash
cd /Users/maorko/Development/GymApp

# ערוך קוד
# ...

# עשה commit ו-push
git add .
git commit -m "Update frontend"
git push

# Vercel יפרוס אוטומטית!
```

---

## 💰 עלויות

| שירות | חינמי עד | לאחר מכן |
|-------|----------|----------|
| **Fly.io** | 3 VMs קטנים, 3GB Storage | $0.0000025/sec per VM |
| **Vercel** | Unlimited deploys | $20/חודש (Pro) |
| **PostgreSQL** | 3GB Storage | $0.15/GB/חודש |

**עבור ~100 משתמשים: 100% חינמי!** 🎉

---

## 🌐 שימוש בדומיין משלך (אופציונלי)

### הוספת דומיין ל-Vercel

1. קנה דומיין (Namecheap, GoDaddy, וכו')
2. ב-Vercel Dashboard → Settings → Domains
3. הוסף את הדומיין
4. עדכן DNS Records אצל ספק הדומיין
5. המתן כ-24 שעות

### הוספת דומיין ל-Fly.io

```bash
# הוסף Certificate
flyctl certs add api.yourdomain.com

# עדכן DNS:
# A Record: api.yourdomain.com → [Fly.io IP]
```

---

## 📞 תמיכה

אם יש בעיות:
1. בדוק את ה-[Fly.io Docs](https://fly.io/docs/)
2. בדוק את ה-[Vercel Docs](https://vercel.com/docs)
3. הרץ `flyctl doctor` לבדיקת בעיות

---

**זהו! האפליקציה שלך פעילה! 🚀💪**

