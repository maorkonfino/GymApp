import React, { useState, useEffect } from 'react'
import { MapPin, Instagram, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react'

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    notes: ''
  })

  const carouselImages = ['/1aboutus.png', '/2aboutus.png']

  // Load Elfsight script for Google Reviews
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://elfsightcdn.com/platform.js'
    script.async = true
    document.body.appendChild(script)

    // Hide Elfsight default headers after widget loads
    const hideHeaders = setInterval(() => {
      const headers = document.querySelectorAll(
        '.eapps-google-reviews-header, .eapps-google-reviews-header-title, .eapps-google-reviews-header-subtitle, [class*="header-title"], [class*="header-subtitle"]'
      )
      headers.forEach((header) => {
        if (header instanceof HTMLElement) {
          header.style.display = 'none'
          header.style.visibility = 'hidden'
          header.style.height = '0'
          header.style.overflow = 'hidden'
        }
      })
      // Stop checking after 10 seconds
      setTimeout(() => clearInterval(hideHeaders), 10000)
    }, 100)

    return () => {
      clearInterval(hideHeaders)
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  const scrollToContactForm = () => {
    const formElement = document.getElementById('contact-form')
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Build WhatsApp message
    let message = 'שלום, אני רוצה לדעת עוד פרטים על התהליך אצלך, הפרטים שלי הם:\n\n'
    message += `שם מלא: ${formData.fullName}\n`
    message += `טלפון: ${formData.phone}\n`
    message += `הערות: ${formData.notes || 'אין'}\n\n`
    message += `🐺 אני רוצה להיות BEAST! 🐺\n\n`
    message += `https://beast-gym.com/aboutUs`
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message)
    
    // Open WhatsApp with message
    window.open(`https://wa.me/972548151103?text=${encodedMessage}`, '_blank')
    
    // Reset form
    setFormData({
      fullName: '',
      phone: '',
      notes: ''
    })
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
      answer: "ברור! חובה! אימוני כוח מומלצים ומאושרים כבר מגיל 6, הגיל אינו קובע אלא היכולות הגופניות שלך, אני כאן להתאים תכנית אימון מותאמת אליך, להשגיח ולהביא אותך לביצועים ברמה הכי גבוהה שאפשר!"
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
          {/* CTA Buttons */}
          <div className="mb-6 space-y-3">
            <button
              onClick={scrollToContactForm}
              className="block bg-white hover:bg-gray-100 text-black font-bold text-xl py-2 px-8 text-center transition-all shadow-lg rounded-full max-w-lg mx-auto border-2 border-gray-200 w-full"
            >
              אני רוצה להיות BE<span className="text-cyan-400">A</span>ST<span className="text-cyan-400">!</span>
            </button>
            <button
              onClick={scrollToContactForm}
              className="block bg-cyan-400 hover:bg-cyan-500 text-[#1a1a1a] font-bold text-base py-2 px-8 text-center transition-all shadow-lg rounded-full max-w-lg mx-auto w-full whitespace-nowrap"
            >
              גר\ה רחוק? בוא\י להיות BE<span className="text-white">A</span>ST בOnline<span className="text-white">!</span>
            </button>
          </div>

          {/* Goal Quote - Above Photo - Wide */}
          <div className="mb-6">
            <div className="py-3 px-6 bg-[#2a2a2a] border-2 border-cyan-400 text-center rounded-xl max-w-lg mx-auto">
              <p className="text-white text-lg leading-relaxed">
                "המטרה שלי היא שתוכלו להתמיד בתהליך, תהנו ממנו, תחוו תוצאות בריאותיות ותקבלו <span className="text-cyan-400">כלים לכל החיים</span>"
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
                <h3 className="text-base font-bold text-white mb-2">
                  <span className="text-cyan-400">+ </span>
                  {item.title}
                </h3>
                <p className="text-sm text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* About Shlomi Section */}
      <section className="bg-[#1a1a1a] pb-12">
        <div className="max-w-6xl mx-auto px-6">
          {/* CTA Buttons Above Title */}
          <div className="mb-6 space-y-3">
            <button
              onClick={scrollToContactForm}
              className="block bg-white hover:bg-gray-100 text-black font-bold text-xl py-2 px-8 text-center transition-all shadow-lg rounded-full max-w-lg mx-auto border-2 border-gray-200 w-full"
            >
              אני רוצה להיות BE<span className="text-cyan-400">A</span>ST<span className="text-cyan-400">!</span>
            </button>
            <button
              onClick={scrollToContactForm}
              className="block bg-cyan-400 hover:bg-cyan-500 text-[#1a1a1a] font-bold text-base py-2 px-8 text-center transition-all shadow-lg rounded-full max-w-lg mx-auto w-full whitespace-nowrap"
            >
              גר\ה רחוק? בוא\י להיות BE<span className="text-white">A</span>ST בOnline<span className="text-white">!</span>
            </button>
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

          {/* Image Carousel */}
          <div className="relative max-w-xs mx-auto mb-6">
            <div className="relative">
              <img
                src={carouselImages[currentImageIndex]}
                alt={`תמונה ${currentImageIndex + 1}`}
                className="w-full h-auto rounded-xl shadow-lg"
              />
              
              {/* Previous Button */}
              <button
                onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-cyan-400 hover:bg-cyan-500 text-white p-2 rounded-full shadow-lg transition-all"
                aria-label="תמונה קודמת"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              {/* Next Button */}
              <button
                onClick={() => setCurrentImageIndex((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1))}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-cyan-400 hover:bg-cyan-500 text-white p-2 rounded-full shadow-lg transition-all"
                aria-label="תמונה הבאה"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-cyan-400 w-6' : 'bg-gray-400'
                    }`}
                    aria-label={`עבור לתמונה ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="py-3 px-6 bg-[#2a2a2a] border-2 border-cyan-400 text-center rounded-xl max-w-lg mx-auto">
            <p className="text-white text-xl font-bold leading-relaxed mb-3">
              אני מזמין אתכם אל הבית שלי,<br />לעשות את הדבר הכי טוב שתוכלו <span className="text-cyan-400">לעשות למענכם</span><span className="text-white">!</span>
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
          <div className="max-w-[200px] mx-auto mb-8">
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
          <div className="flex gap-4 justify-center mb-4">
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

          {/* Social Icons */}
          <div className="flex gap-4 justify-center">
            <a
              href="https://wa.me/972548151103"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 flex items-center justify-center bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full transition-all shadow-md hover:shadow-lg"
              aria-label="צור קשר בוואטסאפ"
            >
              <WhatsAppLogo className="w-6 h-6" />
            </a>
            <a
              href="https://www.instagram.com/shlomi_konfino/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full transition-all shadow-md hover:shadow-lg"
              aria-label="עקבו באינסטגרם"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a
              href="https://share.google/VbA2nUfw3peHiUarh"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 flex items-center justify-center bg-white hover:bg-gray-50 text-gray-800 rounded-full transition-all shadow-md hover:shadow-lg border-2 border-gray-200"
              aria-label="עלינו בגוגל"
            >
              <GoogleLogo className="w-6 h-6" />
            </a>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="bg-[#1a1a1a] pb-12">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
            תשאיר/י פרטים כאן ואחזור אלייך בהקדם!
          </h2>
          
          <form onSubmit={handleSubmit} className="bg-[#2a2a2a] border-2 border-cyan-400 rounded-xl p-6 md:p-8">
            {/* Full Name */}
            <div className="mb-6">
              <label htmlFor="fullName" className="block text-white font-bold mb-2 text-right">
                שם מלא *
              </label>
              <input
                type="text"
                id="fullName"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a1a1a] text-white border-2 border-gray-600 rounded-lg focus:border-cyan-400 focus:outline-none transition-colors"
                placeholder="הכנס שם מלא"
              />
            </div>

            {/* Phone */}
            <div className="mb-6">
              <label htmlFor="phone" className="block text-white font-bold mb-2 text-right">
                טלפון נייד *
              </label>
              <input
                type="tel"
                id="phone"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a1a1a] text-white border-2 border-gray-600 rounded-lg focus:border-cyan-400 focus:outline-none transition-colors"
                placeholder="05X-XXXXXXX"
              />
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label htmlFor="notes" className="block text-white font-bold mb-2 text-right">
                הערות (אופציונלי)
              </label>
              <textarea
                id="notes"
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a1a1a] text-white border-2 border-gray-600 rounded-lg focus:border-cyan-400 focus:outline-none transition-colors resize-none"
                placeholder="ספר/י לנו קצת על עצמך, המטרות שלך, או כל שאלה..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-white hover:bg-gray-100 text-black font-bold text-xl py-3 px-8 text-center transition-all shadow-lg rounded-full border-2 border-gray-200"
            >
              אני רוצה להיות BE<span className="text-cyan-400">A</span>ST<span className="text-cyan-400">!</span>
            </button>
          </form>
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
