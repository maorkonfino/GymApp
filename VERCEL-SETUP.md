# 🚀 Vercel Auto-Deploy Setup

## אם Vercel לא עושה Auto Deploy:

### שלב 1: מחק את הפרויקט הישן ב-Vercel

1. לך ל-**Vercel Dashboard**
2. בחר את הפרויקט **gym-app-olive-one**
3. **Settings** (למטה בתפריט צד שמאל)
4. גלול למטה ל-**"Delete Project"**
5. לחץ **Delete** ואשר

---

### שלב 2: צור פרויקט חדש מ-GitHub

1. **Vercel Dashboard** → לחץ **"Add New..."** → **"Project"**
2. **Import Git Repository:**
   - תראה רשימה של הrepositories שלך
   - חפש **"GymApp"**
   - לחץ **"Import"**

3. **Configure Project:**
   ```
   Project Name: beast-gym  (או שם אחר שתבחר)
   Framework Preset: Vite
   Root Directory: frontend  ⚠️ חשוב!
   Build Command: npm run build
   Output Directory: dist
   ```

4. **Environment Variables:**
   לחץ על **"Environment Variables"** והוסף:
   ```
   VITE_API_URL = https://beast-gym-backend.onrender.com/api
   ```

5. **לחץ "Deploy"** 🚀

---

### שלב 3: וודא שה-Auto Deploy מופעל

אחרי שהפרויקט החדש עלה:

1. **Settings** → **Git**
2. וודא שרשום:
   - ✅ **Connected Git Repository:** maorkonfino/GymApp
   - ✅ **Production Branch:** main
3. **תחת "Deploy Hooks"** צריך להיות רשום:
   - ✅ **"Automatically deploy when pushing to main"**

---

## ✅ בדיקה שזה עובד:

1. עשה שינוי קטן בקובץ כלשהו (למשל README)
2. `git add .`
3. `git commit -m "Test auto deploy"`
4. `git push`
5. **לך ל-Vercel Dashboard** - אמור לראות **"Building..."** 🔄

---

## 🎯 אם עדיין לא עובד:

### בדוק GitHub Integration:

1. **Vercel Dashboard** → **Settings** (ברמת החשבון, לא הפרויקט)
2. **Integrations** → **GitHub**
3. וודא שיש **"Installed"**
4. אם לא - לחץ **"Configure"** ותן גישה ל-repository

---

## 📝 הערות:

- ⚠️ חשוב להגדיר **Root Directory: frontend**
- ⚠️ אם יש לך מספר פרויקטים באותו repo, Vercel צריך לדעת איפה הfrontend
- ✅ אחרי ההגדרה, כל push ל-`main` יעשה deploy אוטומטי

