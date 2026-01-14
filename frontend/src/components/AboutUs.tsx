import React, { useState } from 'react'
import { Users, Target, Award, Mail, MapPin, Clock, Instagram, TrendingUp, Home, CheckCircle, ChevronDown, ChevronUp, Star } from 'lucide-react'

// WhatsApp Logo Component
const WhatsAppLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
)

// Google Logo Component
const GoogleLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const AboutUs: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  const faqs = [
    {
      question: "למי חדר הכושר Beast מתאים?",
      answer: "לכולם! למתחילים, מתקדמים, צעירים ומבוגרים - מגיל 10 ועד גיל 120 ולכל מצב גופני!"
    },
    {
      question: "האם יש הגבלה בכמות האימונים?",
      answer: "האימונים הם ללא הגבלה - זמינים לך תמיד"
    },
    {
      question: "האם מתאמנים לבד או עם עוד מתאמנים?",
      answer: "האימון הוא אישי אך עצמאי בהשגחה צמודה בהתאם לתכנית שלך - לכל מתאמן יש מטרות אישיות ותכנית מדויקת אליו"
    },
    {
      question: "איך נבנת תכנית אימון?",
      answer: "על בסיס מדע מדויק - אבחון ראשוני, מטרות אישיות ומצב בריאותי, אורח חיים וזמינות עם התאמות שוטפות לאורך כל הדרך"
    },
    {
      question: "כמה זמן לוקח לראות תוצאות?",
      answer: "כבר בשבועות הראשונים, עם התמדה ומעקב אישי הדרך מובטחת"
    },
    {
      question: "מה ההבדל בין Beast לחדר כושר מסחרי?",
      answer: "בחדר כושר רגיל משלמים על גישה למתקנים - אצלנו המעטפת מלאה, יחס ומעקב אישיים המותאמים אליך באווירה אינטימית"
    },
    {
      question: "אני בן 13, כדאי לי להתאמן בגילי?",
      answer: "ברור ואפילו מומלץ - במקום אימונים לנערים ונערות עם תכניות מותאמות אישית לבניית הגוף והביטחון בכל יום!"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-bg via-dark-card to-dark-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-dark-bg via-dark-card/30 to-dark-bg">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center">
            {/* Logo and Photo - Centered Together */}
            <div className="flex flex-col items-center gap-6 sm:gap-8 mb-8 sm:mb-10 animate-fade-in">
              {/* Logo - Large */}
              <div>
                <img 
                  src="/header-logo.svg" 
                  alt="BEAST Logo" 
                  className="w-96 sm:w-[600px] lg:w-[700px] h-auto mx-auto"
                />
              </div>

              {/* Trainer Photo - Elegant Integration */}
              <div className="relative inline-block">
                {/* Decorative elements */}
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
                
                {/* Photo */}
                <div className="relative">
                  <img 
                    src="/trainer.jpg" 
                    alt="שלומי - המאמן הראשי" 
                    className="relative w-80 sm:w-96 lg:w-[450px] h-auto mx-auto rounded-2xl shadow-[0_20px_60px_rgba(0,255,255,0.15)] border border-cyan-500/20"
                  />
                  {/* Subtle overlay gradient */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-dark-bg/40 to-transparent pointer-events-none"></div>
                </div>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <a
                href="https://wa.me/972548151103"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-lg transition-all font-bold text-lg shadow-lg"
              >
                <WhatsAppLogo className="w-5 h-5" />
                צור קשר
              </a>
              <a
                href="https://www.instagram.com/shlomi_konfino/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all font-bold text-lg shadow-lg"
              >
                <Instagram className="w-5 h-5" />
                האינסטה שלנו
              </a>
              <a
                href="https://share.google/VbA2nUfw3peHiUarh"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-gray-800 rounded-lg transition-all font-bold text-lg shadow-lg"
              >
                <GoogleLogo className="w-5 h-5" />
                עלינו בגוגל
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Subtitle Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            מתאמנים חופשי ועצמאית עם שלומי - מאמן אישי מוסמך
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed">
            חדר כושר בוטיק עם תכנית אימון מותאמת אישית למטרותיך, השגחה צמודה וללא הגבלת אימונים
          </p>
        </div>
      </section>

      {/* All You Need Section */}
      <section className="py-16 bg-dark-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            כל מה שמתאמן צריך תחת קורת גג אחת
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-dark-hover border border-cyan-500/30 rounded-xl p-8 text-center hover:border-cyan-500/60 transition-all">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">מאמן מוסמך שנמצא במקום</h3>
              <p className="text-gray-400">תמיד זמין לשאלות, הדרכה ותיקון טכניקות</p>
            </div>

            <div className="bg-dark-hover border border-purple-500/30 rounded-xl p-8 text-center hover:border-purple-500/60 transition-all">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Home className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">גישה חופשית לחדר הכושר</h3>
              <p className="text-gray-400">תחת השגחה צמודה וללא הגבלת אימונים</p>
            </div>

            <div className="bg-dark-hover border border-green-500/30 rounded-xl p-8 text-center hover:border-green-500/60 transition-all">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">ליווי אישי ומדויק</h3>
              <p className="text-gray-400">לך ולמטרות שלך עם מעקב צמוד</p>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
            מה מקבלים?
          </h2>
          <p className="text-xl text-gray-300 text-center mb-12 max-w-4xl mx-auto">
            אצלנו בחדר הכושר Beast יש ליווי צמוד בהתאם לתכנית אימון המותאמת למטרות שלך
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 bg-dark-hover/50 rounded-xl p-6 border border-cyan-500/20">
              <CheckCircle className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">תכנית אימון מותאמת אישית</h3>
                <p className="text-gray-400">למטרות שלך למיקסום תוצאות מבוססת מדע</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-dark-hover/50 rounded-xl p-6 border border-purple-500/20">
              <CheckCircle className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">מאמן מוסמך תמיד נוכח</h3>
                <p className="text-gray-400">באימון לליווי והכוונה צמודים</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-dark-hover/50 rounded-xl p-6 border border-green-500/20">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">לימוד ותיקון טכניקות</h3>
                <p className="text-gray-400">עם הכוונה בזמן אמת לביצוע מושלם</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-dark-hover/50 rounded-xl p-6 border border-blue-500/20">
              <CheckCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">מעקב התקדמות לאורך זמן</h3>
                <p className="text-gray-400">בלי לבזבז זמן - רואים בדיוק איפה אתם</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-dark-hover/50 rounded-xl p-6 border border-orange-500/20">
              <CheckCircle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">ליווי מרחוק 24/7</h3>
                <p className="text-gray-400">תמיד זמין לך לכל שאלה או הכוונה</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-dark-hover/50 rounded-xl p-6 border border-pink-500/20">
              <CheckCircle className="w-6 h-6 text-pink-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">אפליקציה ייעודית</h3>
                <p className="text-gray-400">לבקרה ומעקב מדויק על כל התהליך</p>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">גמישות מלאה</h3>
            <p className="text-gray-300 text-center text-lg">
              ייעול זמנים עם פיקוח והכוונה צמודים • תכנית אימון מבוססת מדע - לא אימון קבוצתי או חדר כושר מסחרי • גמישות בשעות האימון ללא הגבלת אימונים
            </p>
          </div>
        </div>
      </section>

      {/* Why BEAST Section */}
      <section className="py-20 bg-dark-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
            למה BEAST?
          </h2>
          <p className="text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto">
            מה מיוחד ב-Beast? חדר כושר במעטפת אישית - מאמן שתמיד בשטח
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-dark-hover border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/50 transition-all">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">אימון מבוסס מדע מותאם אישית</h3>
              <p className="text-gray-400">
                בדיוק ליכולת שלך, למטרות שלך ולאורח החיים שלך
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-dark-hover border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/50 transition-all">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">ניסיון ומקצועיות</h3>
              <p className="text-gray-400">
                פיזיולוג מאמץ, 10 שנות ניסיון כמאמן, בוגר חינוך גופני ואימון מותאם לאוכלוסייה ייחודית
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-dark-hover border border-green-500/20 rounded-xl p-6 hover:border-green-500/50 transition-all">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">מעקב אובייקטיבי</h3>
              <p className="text-gray-400">
                אפליקציה שעושה סדר ומראה לכם כמה התקדמתם באמת!
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-dark-hover border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">חלל מקצועי</h3>
              <p className="text-gray-400">
                ציוד מתוחזק וברמה גבוהה
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-dark-hover border border-orange-500/20 rounded-xl p-6 hover:border-orange-500/50 transition-all">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">תוצאות מוכחות</h3>
              <p className="text-gray-400">
                עשרות אנשים שכבר עשו את השינוי הכי גדול בחייהם
              </p>
            </div>

            {/* Feature 6 - Special */}
            <div className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 rounded-xl p-6 hover:border-cyan-500/70 transition-all">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">יחס אישי ללא אימון אישי</h3>
              <p className="text-gray-300">
                לכל אורך האימון - תהליך מבוסס מדע שאפשר להתמיד בו ולראות תוצאות אמיתיות לאורך זמן
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Shlomi Section */}
      <section className="py-20 bg-gradient-to-b from-dark-bg to-dark-card/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-dark-hover border border-cyan-500/30 rounded-2xl p-8 sm:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                הכירו את שלומי קונפינו
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
              <p>
                <span className="text-cyan-400 font-bold">אני שלומי קונפינו</span> - מאמן כושר אישי מוסמך, בעל תואר ראשון בחינוך גופני ותואר שני בפיזיולוגיה של המאמץ באוניברסיטת תל אביב. בעל <span className="text-white font-semibold">10 שנות ניסיון</span> בתחום הכושר הגופני.
              </p>
              
              <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-r-4 border-cyan-500 rounded-lg p-6">
                <p className="text-white text-xl font-semibold mb-3">
                  אני מאמין בתהליכי אימון מבוססי מדע בהתאם למטרות שלך
                </p>
                <p>
                  בין אם זה חיטוב, עליה במשקל, חיזוק הביטחון העצמי והגוף ואפילו לכיף
                </p>
              </div>

              <p className="text-xl text-white font-semibold">
                המטרה שלי היא שהמתאמנים שלי יתמידו ויהנו מהתהליך ולא רק יתאמנו. אני מזמין אתכם להצטרף לבית שלנו
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-16 bg-dark-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              המיקום שלנו
            </h2>
            <div className="flex items-center justify-center gap-3 text-xl text-gray-300">
              <MapPin className="w-6 h-6 text-cyan-400" />
              <span>קיבוץ מעברות, בלב עמק חפר</span>
            </div>
          </div>

          <div className="bg-dark-hover border border-purple-500/30 rounded-xl p-8 max-w-3xl mx-auto">
            <p className="text-gray-300 text-lg text-center leading-relaxed mb-6">
              חדר הכושר Beast ממוקם בקיבוץ מעברות בלב עמק חפר. החדר כולל <span className="text-white font-semibold">ציוד מקצועי, מכשירי כוח ואירובי</span> באווירה אינטימית, נינוחה ובגובה העיניים.
            </p>
            <div className="text-center">
              <p className="text-cyan-400 font-bold text-xl">
                אני מזמין אתכם לפגישת התרשמות בחינם וזמין לכם כאן תמיד
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
            מה אומרים עלינו?
          </h2>
          <p className="text-xl text-gray-300 text-center mb-12">
            ביקורות מתאמנים
          </p>
          
          <div className="text-center py-12">
            <a
              href="https://share.google/VbA2nUfw3peHiUarh"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white hover:bg-gray-100 text-gray-800 rounded-xl transition-all font-bold text-xl shadow-xl"
            >
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              <span className="mr-2">קראו את הביקורות שלנו בגוגל</span>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-dark-card/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            שאלות נפוצות
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-dark-hover border border-cyan-500/20 rounded-xl overflow-hidden hover:border-cyan-500/40 transition-all"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-right"
                >
                  <span className="text-lg font-bold text-white pr-2">
                    {faq.question}
                  </span>
                  {openFAQ === index ? (
                    <ChevronUp className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                  )}
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-300 text-lg leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-b from-dark-bg via-dark-card/50 to-dark-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
            רוצה להוציא את ה-BEAST שבך?
          </h2>
          <p className="text-xl sm:text-2xl text-gray-300 mb-10">
            השאר פרטים לשיחת ייעוץ חינם - בלי התחייבות
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/972548151103"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl transition-all font-bold text-xl shadow-xl"
            >
              <WhatsAppLogo className="w-6 h-6" />
              שיחת ייעוץ חינם
            </a>
            <a
              href="tel:0548151103"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition-all font-bold text-xl shadow-xl"
            >
              <Mail className="w-6 h-6" />
              התקשר עכשיו
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-dark-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            בוא נתחיל את המסע שלך
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#25D366]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <WhatsAppLogo className="w-6 h-6 text-[#25D366]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">WhatsApp</h3>
                  <a href="https://wa.me/972548151103" target="_blank" rel="noopener noreferrer" className="text-[#25D366] hover:text-[#20BD5A] transition-colors text-lg">
                    054-815-1103
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">אימייל</h3>
                  <a href="mailto:info@beast-training.com" className="text-purple-400 hover:text-purple-300 transition-colors text-lg">
                    info@beast-training.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">מיקום</h3>
                  <p className="text-gray-300 text-lg">
                    קיבוץ מעברות, עמק חפר
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">שעות פעילות</h3>
                  <p className="text-gray-300">
                    ראשון - חמישי: 06:00 - 22:00
                  </p>
                  <p className="text-gray-300">
                    שישי: 06:00 - 14:00
                  </p>
                  <p className="text-gray-300">
                    שבת: סגור
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Card */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-8 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                מוכן להתחיל?
              </h3>
              <p className="text-gray-300 mb-6 text-lg">
                הצטרף אלינו עוד היום והתחל את המסע שלך להיות הגרסה הכי טובה של עצמך
              </p>
              <a
                href="https://wa.me/972548151103"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-lg transition-all font-bold text-lg shadow-lg"
              >
                <WhatsAppLogo className="w-5 h-5" />
                צור קשר - 054-815-1103
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-card border-t border-dark-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2026 BEAST Training. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default AboutUs
