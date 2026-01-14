import React, { useState } from 'react'
import { MapPin, Instagram, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'

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

// Waze Logo Component
const WazeLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-3-7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm6 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm-3 4c1.93 0 3.5-1.43 3.5-3.2h-7c0 1.77 1.57 3.2 3.5 3.2z"/>
  </svg>
)

// Google Maps Logo Component  
const GoogleMapsLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#EA4335"/>
    <path d="M12 11.5c1.38 0 2.5-1.12 2.5-2.5S13.38 6.5 12 6.5 9.5 7.62 9.5 9s1.12 2.5 2.5 2.5z" fill="#FBBC05"/>
    <path d="M12 2c-3.87 0-7 3.13-7 7 0 5.25 7 13 7 13V2z" fill="#34A853"/>
  </svg>
)

const AboutUs: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  const faqs = [
    {
      question: (
        <span>
          למי חדר הכושר <span>BE<span className="text-cyan-400">A</span>ST</span> מתאים?
        </span>
      ),
      answer: "לכולם! לנערים ונערות, נשים וגברים, מגיל 10 ועד 120 ובכל מצב גופני. אימוני כוח הם לכולם!"
    },
    {
      question: "האם יש הגבלה בכמות האימונים בשבוע?",
      answer: "אין מגבלה! המנוי מקנה כניסה חופשית אל החלל בתאום מראש דרך האפליקציה ותכנית האימון תהיה מותאמת לכמות האימונים שתוכלו לבצע בשבוע."
    },
    {
      question: "האם האימון אישי או עם עוד מתאמנים?",
      answer: "החלל פתוח לכולם, האימון הוא עצמאי וכל אחד עובד עם תוכנית האימון האישית שלו אך במקביל לנרשמים הנוספים בחלל כך שלפעמים אולי תזכו לאימון 1 על 1 איתי ולפעמים תזכו להכיר מתאמנים נוספים ולקבל יחס אישי ממני גם בזמן שעוד מתאמנים נמצאים."
    },
    {
      question: "איך נבנת תכנית האימון?",
      answer: "מפגש היכירות וניתוח מצב נוכחי, בניית תכנית אימון מותאמת אישית אליכם, מפגשים בחדר הכושר ללמידה טכנית ועקרונות האימון והכל בהאתם ליכולתכם, מצבכם, למדע עדכני וניסיון רב."
    },
    {
      question: "כמה זמן לוקח לראות תוצאות?",
      answer: "תוצאות ראשוניות רואים די מיידית, תוצאות למטרות ארוכות טווח רואים לאחר זמן התמדה ומשך הזמן יכול להשתנות בהתאם להמון גורמים עליהם נדבר כשנתחיל."
    },
    {
      question: (
        <span>
          מה ההבדל בין <span>BE<span className="text-cyan-400">A</span>ST</span> לחדר כושר מסחרי או אימונים אישיים?
        </span>
      ),
      answer: "אצלנו תחת מחיר אחד תקבלו גישה אל חלל מאובזר אך אינטימי ללא מגבלה של כמות האימונים, תכנית אימון מותאמת אישית, נוכחות מאמן בכל האימונים שלכם עם יחס אישי, לימוד טכני ודיוק מרבי, זמינות מחוץ לשעות האימון וליווי תזונתי תומך."
    },
    {
      question: "אני בן 14, כדאי לי להתחיל להתאמן?",
      answer: "ברור! חובה! אימוני כוח מומלצים ומאושרים כבר מגיל 6, הגיל אינו קובע אלה היכולות הגופניות שלך, אני כאן להתאים תכנית אימון מותאמת אליך, להשגיח ולהביא אותך לביצועים ברמה הכי גבוהה שאפשר!"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-bg via-dark-card to-dark-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-dark-bg via-dark-card/30 to-dark-bg">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <div className="text-center">
            {/* Logo and Photo - Centered Together */}
            <div className="flex flex-col items-center gap-4 sm:gap-6 mb-6 sm:mb-8 animate-fade-in">
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
            
            {/* Main CTA Text */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 animate-fade-in px-4">
              רוצה להוציא את ה-BE<span className="text-cyan-400">A</span>ST שבך?
            </h2>
            
            {/* CTA Buttons - Square Icons Only */}
            <div className="flex gap-3 justify-center animate-fade-in">
              <a
                href="https://wa.me/972548151103"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl transition-all shadow-lg"
                aria-label="צור קשר בוואטסאפ"
              >
                <WhatsAppLogo className="w-7 h-7" />
              </a>
              <a
                href="https://www.instagram.com/shlomi_konfino/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all shadow-lg"
                aria-label="עקבו באינסטגרם"
              >
                <Instagram className="w-7 h-7" />
              </a>
              <a
                href="https://share.google/VbA2nUfw3peHiUarh"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-14 h-14 bg-white hover:bg-gray-100 text-gray-800 rounded-xl transition-all shadow-lg"
                aria-label="עלינו בגוגל"
              >
                <GoogleLogo className="w-7 h-7" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* All You Need Section */}
      <section className="py-16 bg-dark-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            כל מה שמתאמן צריך תחת קורת גג אחת
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 bg-dark-hover/50 rounded-xl p-6 border border-cyan-500/20">
              <CheckCircle className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">תכנית אימון מותאמת אישית</h3>
                <p className="text-gray-400">למטרות שלך, ליכולות שלך ולאורח החיים שלך</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-dark-hover/50 rounded-xl p-6 border border-purple-500/20">
              <CheckCircle className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">נוכחות מאמן מוסמך</h3>
                <p className="text-gray-400">ליווי והכוונה צמודים, לימוד ותיקון טכניקה בזמן אמת</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-dark-hover/50 rounded-xl p-6 border border-green-500/20">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">מעקב אובייקטיבי</h3>
                <p className="text-gray-400">אפליקציה המרכזת את הכל ועושה סדר, מראה לכם כמה התקדמתם בתהליך</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-dark-hover/50 rounded-xl p-6 border border-blue-500/20">
              <CheckCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">זמינות מרחוק</h3>
                <p className="text-gray-400">זמינות ומעטפת גם מחוץ לאימון להצלחה בתהליך</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-dark-hover/50 rounded-xl p-6 border border-orange-500/20">
              <CheckCircle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">ליווי תזונתי</h3>
                <p className="text-gray-400">תזונה תומכת אימון, מטרה וביצועים</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-dark-hover/50 rounded-xl p-6 border border-pink-500/20">
              <CheckCircle className="w-6 h-6 text-pink-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">גמישות מלאה</h3>
                <p className="text-gray-400">תכנית האימון תשתנה בהתאם לשינויים בחייכם כך שתמיד תוכלו להתמיד</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-dark-hover/50 rounded-xl p-6 border border-purple-500/20">
              <CheckCircle className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">חלל אינטימי ומקצועי</h3>
                <p className="text-gray-400">ציוד מקצועי ואווירה ביתית</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-dark-hover/50 rounded-xl p-6 border border-yellow-500/20">
              <CheckCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">תוצאות מוכחות</h3>
                <p className="text-gray-400">עשרות אנשים שכבר עשו את השינוי הטוב ביותר עבורם</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Shlomi Section */}
      <section className="py-16 bg-dark-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            הכירו את שלומי קונפינו
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            {/* 1. Academic Credentials - All Together */}
            <div className="flex items-start gap-4 bg-dark-hover/50 rounded-xl p-6 border border-cyan-500/20">
              <CheckCircle className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <p className="text-white text-lg font-bold">
                  פיזיולוג מאמץ בוגר תואר שני בפקולטה לרפואה באוניברסיטת תל אביב
                </p>
                <p className="text-white text-lg font-bold">
                  10 שנות ניסיון כמאמן
                </p>
                <p className="text-white text-lg font-bold">
                  בוגר תואר ראשון בחינוך גופני עם הסמכה לאוכלוסייה ייחודית
                </p>
              </div>
            </div>
            
            {/* 2. Philosophy & Goal - Combined */}
            <div className="flex items-start gap-4 bg-dark-hover/50 rounded-xl p-6 border border-purple-500/20">
              <CheckCircle className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
              <div className="space-y-4">
                <p className="text-white text-lg leading-relaxed">
                  "אני מאמין בתהליך אימון מבוסס מדע וניסיון המותאם לאורח החיים האישי שלך"
                </p>
                <p className="text-gray-400 leading-relaxed">
                  בין אם זה חיטוב, עלייה במסת השריר, חיזוק הביטחון העצמי וכל זה בהנאה מהתהליך.
                </p>
                <p className="text-white text-lg leading-relaxed">
                  "המטרה שלי היא שהמתאמנים שלי יתמידו, יהנו מהתהליך, יחוו תוצאות בריאותיות ויקבלו כלים לכל החיים"
                </p>
              </div>
            </div>

            {/* 3. Invitation */}
            <div className="flex items-start gap-4 bg-dark-hover/50 rounded-xl p-6 border border-green-500/20">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-white text-xl font-bold leading-relaxed">
                  אני מזמין אתכם אל הבית שלי, לעשות את הדבר הכי טוב שתוכלו לעשות למענכם.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-16 bg-dark-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              המיקום שלנו
            </h2>
            <div className="flex items-center justify-center gap-3 text-xl text-gray-300 mb-8">
              <MapPin className="w-6 h-6 text-cyan-400" />
              <span>קיבוץ מעברות, עמק חפר</span>
            </div>

            {/* Navigation Icons */}
            <div className="flex gap-4 justify-center">
              <a
                href="https://waze.com/ul?q=קיבוץ מעברות"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-16 h-16 bg-[#33CCFF] hover:bg-[#2BB8E8] text-white rounded-xl transition-all shadow-lg"
                aria-label="נווט עם Waze"
              >
                <WazeLogo className="w-8 h-8" />
              </a>
              <a
                href="https://maps.google.com/?q=קיבוץ מעברות"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-16 h-16 bg-white hover:bg-gray-100 rounded-xl transition-all shadow-lg"
                aria-label="נווט עם Google Maps"
              >
                <GoogleMapsLogo className="w-8 h-8" />
              </a>
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
            <div className="bg-dark-hover/50 border border-cyan-500/20 rounded-xl p-12">
              <p className="text-2xl font-bold text-cyan-400">
                סרטון בקרוב
              </p>
            </div>
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
                  <div className="text-lg font-bold text-white pr-2">
                    {faq.question}
                  </div>
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
      <section className="py-16 bg-dark-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* CTA Text */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 animate-fade-in px-4">
              רוצה להוציא את ה-BE<span className="text-cyan-400">A</span>ST שבך?
            </h2>
            
            {/* CTA Buttons - Square Icons Only */}
            <div className="flex gap-3 justify-center animate-fade-in">
              <a
                href="https://wa.me/972548151103"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl transition-all shadow-lg"
                aria-label="צור קשר בוואטסאפ"
              >
                <WhatsAppLogo className="w-7 h-7" />
              </a>
              <a
                href="https://www.instagram.com/shlomi_konfino/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all shadow-lg"
                aria-label="עקבו באינסטגרם"
              >
                <Instagram className="w-7 h-7" />
              </a>
              <a
                href="https://share.google/VbA2nUfw3peHiUarh"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-14 h-14 bg-white hover:bg-gray-100 text-gray-800 rounded-xl transition-all shadow-lg"
                aria-label="עלינו בגוגל"
              >
                <GoogleLogo className="w-7 h-7" />
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
