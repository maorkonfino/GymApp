# ⚡ Quick Deploy Guide - 15 דקות

## 🚀 דפלוי מהיר ב-3 שלבים

### ✅ דרישות מקדימות

```bash
# התקן Fly.io CLI
brew install flyctl  # macOS
# או
curl -L https://fly.io/install.sh | sh  # Linux/WSL

# התחבר
flyctl auth login
npx vercel login
```

---

## 1️⃣ Backend (5 דקות)

```bash
cd backend

# צור PostgreSQL
flyctl postgres create --name beast-gym-db --region ams
# 🔴 שמור את ה-Connection String!

# צור ופרוס Backend
flyctl launch --no-deploy
flyctl secrets set DATABASE_URL="<CONNECTION_STRING_FROM_ABOVE>"
flyctl secrets set ADMIN_EMAIL="konfinoshlomi@gmail.com"
flyctl deploy

# בדוק
curl https://YOUR-APP-NAME.fly.dev/api/health
```

---

## 2️⃣ Frontend (5 דקות)

```bash
cd ..

# העלה לגיטהאב
git init
git add .
git commit -m "Deploy"
# צור repo בגיטהאב ואז:
git remote add origin https://github.com/YOUR-USERNAME/beast-gym.git
git push -u origin main
```

**אז:**
1. גש ל-[vercel.com/new](https://vercel.com/new)
2. בחר את ה-repo
3. הגדר:
   - Root Directory: `frontend`
   - Framework: `Vite`
   - Environment Variable: `VITE_API_URL` = `https://YOUR-BACKEND.fly.dev/api`
4. Deploy!

---

## 3️⃣ הגדרות סופיות (5 דקות)

```bash
# עדכן CORS
cd backend
flyctl secrets set FRONTEND_URL="https://YOUR-FRONTEND.vercel.app"
flyctl deploy
```

**צור Admin:**
1. גש לאתר הפרונט
2. הירשם עם `konfinoshlomi@gmail.com`
3. הפוך ל-admin:
```bash
flyctl postgres connect -a beast-gym-db
UPDATE users SET role = 'admin' WHERE email = 'konfinoshlomi@gmail.com';
\q
```

---

## ✅ סיימת!

- 🌐 Frontend: `https://YOUR-APP.vercel.app`
- ⚙️ Backend: `https://YOUR-APP.fly.dev`
- 💾 Database: PostgreSQL @ Fly.io

---

## 🔄 עדכונים עתידיים

**Backend:**
```bash
cd backend
flyctl deploy
```

**Frontend:**
```bash
git add .
git commit -m "Update"
git push  # Vercel auto-deploys!
```

---

**זהו! 100% חינמי ל-~100 משתמשים! 🎉**

📚 מדריך מפורט: ראה [DEPLOYMENT.md](./DEPLOYMENT.md)

