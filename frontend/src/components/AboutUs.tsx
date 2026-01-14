import React from 'react'
import { Dumbbell, Users, Target, Award, Mail, MapPin, Clock, MessageCircle, Instagram, Star } from 'lucide-react'

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-bg via-dark-card to-dark-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-dark-bg via-dark-card/30 to-dark-bg">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center">
            {/* Logo */}
            <div className="mb-8 sm:mb-12 animate-fade-in">
              <img 
                src="/header-logo.svg" 
                alt="BEAST Logo" 
                className="w-96 sm:w-[600px] lg:w-[700px] h-auto mx-auto"
              />
            </div>

            {/* Trainer Photo - Elegant Integration */}
            <div className="mb-8 sm:mb-10 animate-fade-in">
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
                <MessageCircle className="w-5 h-5" />
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
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all font-bold text-lg shadow-lg"
              >
                <Star className="w-5 h-5" />
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
                  <MessageCircle className="w-6 h-6 text-[#25D366]" />
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
                <MessageCircle className="w-5 h-5" />
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

