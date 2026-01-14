import React from 'react'
import { Dumbbell, Users, Target, Award, Mail, MapPin, Clock, Instagram } from 'lucide-react'

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

      {/* Features Section */}
      <section className="py-20 bg-dark-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-16">
            למה BEAST?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-dark-hover border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/50 transition-all">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                <Dumbbell className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">אימונים מותאמים אישית</h3>
              <p className="text-gray-400">
                תוכניות אימון מותאמות במיוחד למטרות שלך ולרמת הכושר שלך
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-dark-hover border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/50 transition-all">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">מאמנים מקצועיים</h3>
              <p className="text-gray-400">
                צוות מאמנים מוסמכים ומנוסים שמלווים אותך בכל שלב
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-dark-hover border border-green-500/20 rounded-xl p-6 hover:border-green-500/50 transition-all">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">מעקב והתקדמות</h3>
              <p className="text-gray-400">
                מערכת מעקב דיגיטלית מתקדמת שעוזרת לך לראות תוצאות
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-dark-hover border border-orange-500/20 rounded-xl p-6 hover:border-orange-500/50 transition-all">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">תוצאות מוכחות</h3>
              <p className="text-gray-400">
                מאות מתאמנים שהשיגו את המטרות שלהם והגיעו לשיא הכושר
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-16">
            השירותים שלנו
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-xl p-8 hover:border-cyan-500/50 transition-all">
              <h3 className="text-2xl font-bold text-cyan-400 mb-4">אימוני כוח</h3>
              <p className="text-gray-300 mb-6">
                בניית שרירים, חיטוב הגוף והגדלת כוח באמצעות אימוני משקולות מקצועיים
              </p>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                  תוכנית מותאמת אישית
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                  ליווי מאמן אישי
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                  מעקב והתקדמות
                </li>
              </ul>
            </div>

            {/* Service 2 */}
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl p-8 hover:border-purple-500/50 transition-all">
              <h3 className="text-2xl font-bold text-purple-400 mb-4">אימוני קרוספיט</h3>
              <p className="text-gray-300 mb-6">
                שיפור כושר אירובי, גמישות וכוח פונקציונלי באמצעות אימונים מגוונים
              </p>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                  קבוצות קטנות
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                  אווירה מעצימה
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                  כל הרמות מתאימות
                </li>
              </ul>
            </div>

            {/* Service 3 */}
            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl p-8 hover:border-green-500/50 transition-all">
              <h3 className="text-2xl font-bold text-green-400 mb-4">ייעוץ תזונתי</h3>
              <p className="text-gray-300 mb-6">
                תפריט תזונה מותאם אישית שמשלים את האימונים ומזרז את התוצאות
              </p>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                  תפריט מותאם אישית
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                  מעקב יומי
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                  תמיכה מתמדת
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-dark-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-16">
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
                    ישראל
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

