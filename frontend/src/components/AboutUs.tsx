import React, { useState, useEffect } from 'react'
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react'

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

  // Load Elfsight script for Google Reviews
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://elfsightcdn.com/platform.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

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
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Hero Header Section */}
      <section className="relative bg-[#1a1a1a] py-6">
        <div className="max-w-6xl mx-auto px-6">
          {/* Logo - Centered & Larger */}
          <div className="text-center mb-3">
            <img 
              src="/header-logo.svg" 
              alt="BEAST Logo" 
              className="w-64 md:w-80 h-auto mx-auto"
            />
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6">
          {/* Rounded CTA Button - Wide */}
          <div className="mb-6">
            <a
              href="https://wa.me/972548151103"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-cyan-400 hover:bg-cyan-500 text-[#1a1a1a] font-bold text-xl py-2 px-8 text-center transition-all shadow-lg rounded-full max-w-lg mx-auto"
            >
              אני רוצה להיות BEAST!
            </a>
          </div>

          {/* Goal Quote - Above Photo - Wide */}
          <div className="mb-6">
            <div className="py-3 px-6 bg-[#2a2a2a] border-2 border-cyan-400 text-center rounded-xl max-w-lg mx-auto">
              <p className="text-white text-lg leading-relaxed">
                "המטרה שלי היא שתוכלו להתמיד בתהליך, תהנו ממנו, תחוו תוצאות בריאותיות ותקבלו כלים לכל החיים"
              </p>
            </div>
          </div>

          {/* Trainer Photo - Below Quote - Smaller */}
          <div className="max-w-xs mx-auto">
            <img 
              src="/trainer.jpg" 
              alt="שלומי קונפינו - המאמן" 
              className="w-full h-auto rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="bg-[#1a1a1a] pb-3">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              כל מה שמתאמן צריך
            </h2>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyan-400 leading-tight">
              תחת קורת גג אחת
            </h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: "תכנית אימון מותאמת אישית", desc: "למטרות שלך, ליכולות שלך ולאורח החיים שלך" },
              { title: "נוכחות מאמן בכל האימון שלכם", desc: "ליווי והכוונה צמודים, לימוד ותיקון טכניקה בזמן אמת" },
              { title: "חלל אינטימי ומקצועי", desc: "ציוד מקצועי ואווירה ביתית" },
              { title: "מעקב אובייקטיבי", desc: "אפליקציה המרכזת את הכל ועושה סדר, מראה לכם כמה התקדמתם בתהליך" },
              { title: "ליווי תזונתי", desc: "תזונה תומכת אימון, מטרה וביצועים" },
              { title: "תוצאות מוכחות", desc: "עשרות אנשים שכבר עשו את השינוי הטוב ביותר עבורם" },
              { title: "גמישות מלאה", desc: "תכנית האימון תשתנה בהתאם לשינויים בחייכם כך שתמיד תוכלו להתמיד" },
              { title: "זמינות מרחוק", desc: "זמינות ומעטפת גם מחוץ לאימון להצלחה בתהליך" }
            ].map((item, index) => (
              <div key={index} className="p-4 border-r-4 border-cyan-400 bg-[#2a2a2a] hover:bg-[#333333] transition-colors">
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Shlomi Section */}
      <section className="bg-[#1a1a1a] pb-12">
        <div className="max-w-6xl mx-auto px-6">
          {/* CTA Button Above Title */}
          <div className="mb-6">
            <a
              href="https://wa.me/972548151103"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-cyan-400 hover:bg-cyan-500 text-[#1a1a1a] font-bold text-xl py-2 px-8 text-center transition-all shadow-lg rounded-full max-w-lg mx-auto"
            >
              אני רוצה להיות BEAST!
            </a>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              הכירו את
            </h2>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyan-400 leading-tight">
              שלומי קונפינו
            </h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 border-r-4 border-cyan-400 bg-[#2a2a2a] hover:bg-[#333333] transition-colors">
              <h3 className="text-base font-bold text-white mb-2">פיזיולוג מאמץ</h3>
              <p className="text-sm text-gray-300">תואר שני הפקולטה לרפואה אונ' ת"א</p>
            </div>
            
            <div className="p-4 border-r-4 border-cyan-400 bg-[#2a2a2a] hover:bg-[#333333] transition-colors">
              <h3 className="text-base font-bold text-white mb-2">10 שנות ניסיון</h3>
              <p className="text-sm text-gray-300">ניסיון רב ומוכח בתחום האימון וליווי תהליכים</p>
            </div>
            
            <div className="p-4 border-r-4 border-cyan-400 bg-[#2a2a2a] hover:bg-[#333333] transition-colors">
              <h3 className="text-base font-bold text-white mb-2">בוגר תואר ראשון</h3>
              <p className="text-sm text-gray-300">חינוך גופני סמינר הקיבוצים</p>
            </div>
            
            <div className="p-4 border-r-4 border-cyan-400 bg-[#2a2a2a] hover:bg-[#333333] transition-colors">
              <h3 className="text-base font-bold text-white mb-2">הסמכות מקצועיות</h3>
              <p className="text-sm text-gray-300">- פעילות גופנית לאוכלוסייה ייחודית<br />- תזונת ספורט</p>
            </div>
          </div>

          <div className="py-3 px-6 bg-[#2a2a2a] border-2 border-cyan-400 text-center rounded-xl max-w-lg mx-auto">
            <p className="text-white text-xl font-bold leading-relaxed mb-3">
              אני מזמין אתכם אל הבית שלי,<br />לעשות את הדבר הכי טוב שתוכלו לעשות למענכם
            </p>
            <p className="text-sm text-gray-300">
              ללא קיצוניות מיותרת, בין אם חיטוב, עלייה במסת השריר, חיזוק הביטחון העצמי, שיפור התפקוד ובניית גוף חזק ובריא
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-[#1a1a1a] pb-12">
        <div className="max-w-6xl mx-auto px-6">
          {/* YouTube Shorts Video */}
          <div className="max-w-xs mx-auto mb-8">
            <div className="relative w-full" style={{ paddingBottom: '177.78%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-xl shadow-2xl"
                src="https://www.youtube.com/embed/Sl9eKv4wq1A"
                title="Be The Beast"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-6">
            מה אומרים עלינו
          </h2>

          {/* Elfsight Google Reviews Widget */}
          <div className="elfsight-widget-wrapper">
            <div className="elfsight-app-352e8cfb-3e65-4fa9-ba94-0d6c292a3335" data-elfsight-app-lazy></div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[#1a1a1a] pb-12">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-6">
            שאלות נפוצות
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-[#2a2a2a] border-2 border-gray-700 rounded-lg overflow-hidden hover:border-cyan-400 transition-all"
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
                  <div className="px-6 pb-6 border-t-2 border-gray-700 pt-4">
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

      {/* Location Section */}
      <section className="bg-[#1a1a1a] pb-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            המיקום שלנו
          </h2>
          <div className="flex items-center justify-center gap-2 text-xl text-gray-300 mb-6">
            <MapPin className="w-6 h-6 text-cyan-400" />
            <span>קיבוץ מעברות, עמק חפר</span>
          </div>

          {/* Navigation Icons */}
          <div className="flex gap-4 justify-center">
            <a
              href="https://waze.com/ul?q=קיבוץ מעברות"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 flex items-center justify-center bg-[#33CCFF] hover:bg-[#2BB8E8] text-white rounded-full transition-all shadow-md hover:shadow-lg"
              aria-label="נווט עם Waze"
            >
              <WazeLogo className="w-6 h-6" />
            </a>
            <a
              href="https://maps.google.com/?q=קיבוץ מעברות"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 flex items-center justify-center bg-white hover:bg-gray-50 rounded-full transition-all shadow-md hover:shadow-lg border-2 border-gray-200"
              aria-label="נווט עם Google Maps"
            >
              <GoogleMapsLogo className="w-6 h-6" />
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-[#1a1a1a] pb-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <a
            href="https://wa.me/972548151103"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-cyan-400 hover:bg-cyan-500 text-[#1a1a1a] font-bold text-xl py-2 px-8 text-center transition-all shadow-lg rounded-full max-w-lg mx-auto"
          >
            אני רוצה להיות BEAST!
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2026 BEAST Training. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default AboutUs
