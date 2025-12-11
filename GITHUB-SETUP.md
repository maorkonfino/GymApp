# 📦 העלאת הפרויקט ל-GitHub

לפני שתוכל להעלות את האפליקציה ל-Railway ו-Vercel, צריך להעלות אותה ל-GitHub.

## 🚀 שלבים:

### 1. צור Repository חדש ב-GitHub

1. לך ל-https://github.com/new
2. תן שם לפרויקט: `GymApp` (או כל שם אחר)
3. בחר **Private** או **Public** (לפי הבחירה שלך)
4. **אל** תסמן "Initialize this repository with a README"
5. לחץ "Create repository"

---

### 2. העלה את הקוד

פתח טרמינל בתיקיית הפרויקט והרץ:

```bash
cd /Users/maorko/Development/GymApp

# אתחול Git (אם עוד לא נעשה)
git init

# הוסף את כל הקבצים
git add .

# עשה commit ראשון
git commit -m "Initial commit - Gym App"

# חבר ל-GitHub (החלף YOUR-USERNAME והשם של הריפו)
git remote add origin https://github.com/YOUR-USERNAME/GymApp.git

# העלה את הקוד
git branch -M main
git push -u origin main
```

---

### 3. וודא שהקוד עלה

1. רענן את הדף ב-GitHub
2. אמור לראות את כל הקבצים

---

## ✅ מה הלאה?

עכשיו אפשר להמשיך להעלאה:
- 📖 [מדריך מהיר (10 דקות)](./QUICK-START-DEPLOYMENT.md)
- 📖 [מדריך מלא](./DEPLOYMENT.md)

---

## 🔄 עדכונים עתידיים

כל שינוי שתעשה בקוד:

```bash
git add .
git commit -m "תיאור השינוי"
git push
```

Railway ו-Vercel יעדכנו את האפליקציה אוטומטית! 🎉



