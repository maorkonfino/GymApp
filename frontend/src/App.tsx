import { useState, useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Header from './components/Header'
import NavigationCards from './components/NavigationCards'
import LoginModal from './components/LoginModal'
import ProfileModal from './components/ProfileModal'
import RegistrationModal from './components/RegistrationModal'
import WorkoutPlanUser from './components/WorkoutPlanUser'
import NutritionTracking from './components/NutritionTracking'
import FullWeekView from './components/FullWeekView'
import MyWorkouts from './components/MyWorkouts'
import LoginPage from './components/LoginPage'
import ManageUsers from './components/ManageUsers'
import ForgotPasswordModal from './components/ForgotPasswordModal'
import ResetPassword from './components/ResetPassword'
import WorkoutArchive from './components/WorkoutArchive'
import AboutUs from './components/AboutUs'
import api from './api'

function AppContent() {
  const { user, login, register } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState({ startTime: '06:00', endTime: '07:00' })
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showManageUsers, setShowManageUsers] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [weekOffset, setWeekOffset] = useState(0)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [editingRegistration, setEditingRegistration] = useState<any>(null)

  // Cleanup old registrations on app load
  useEffect(() => {
    const cleanupOldRegistrations = async () => {
      try {
        await api.delete('/registrations/cleanup/old')
        console.log('Old registrations cleaned up')
      } catch (error) {
        console.error('Error cleaning up old registrations:', error)
      }
    }
    cleanupOldRegistrations()
  }, [])

  // Reset weekOffset to 0 when switching to home/registration view
  useEffect(() => {
    if (location.pathname === '/') {
      setWeekOffset(0)
    }
  }, [location.pathname])
  
  // Redirect OnlineBEAST users from registration page to workout plan
  useEffect(() => {
    if (user?.role === 'onlinebeast' && location.pathname === '/') {
      navigate('/workout-plan', { replace: true })
    }
  }, [user, location.pathname, navigate])

  const handleWeekChange = (direction: 'prev' | 'next') => {
    setWeekOffset(prev => direction === 'next' ? prev + 1 : prev - 1)
  }

  const handleDataChange = () => {
    // Trigger refresh for all components
    setRefreshTrigger(prev => prev + 1)
  }

  // Scroll to top when changing routes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  const handleCellClick = (date: Date, timeRange: string) => {
    const [startTime] = timeRange.split('-')
    // Calculate end time (1 hour later)
    const [hours, minutes] = startTime.split(':').map(Number)
    const endHours = hours + 1
    const endTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    
    setSelectedDate(date)
    setSelectedTime({ startTime, endTime })
    setEditingRegistration(null) // Clear editing state
    setShowRegistrationForm(true)
  }

  const handleCloseRegistrationForm = () => {
    setShowRegistrationForm(false)
    setEditingRegistration(null)
  }

  // Check if we're on public pages (no authentication required)
  // IMPORTANT: Check public pages FIRST before authentication
  const isResetPasswordPage = location.pathname === '/reset-password'
  const isAboutUsPage = location.pathname === '/aboutUs'

  // Public pages (accessible without login) - CHECK FIRST!
  if (isAboutUsPage) {
    return <AboutUs />
  }

  if (isResetPasswordPage) {
    return <ResetPassword />
  }

  // Show login page if user is not authenticated
  if (!user) {
    return (
      <>
        <LoginPage 
          onLogin={login} 
          onRegister={register} 
          onForgotPassword={(email) => {
            setForgotPasswordEmail(email)
            setShowForgotPassword(true)
          }}
        />
        <ForgotPasswordModal
          isOpen={showForgotPassword}
          onClose={() => {
            setShowForgotPassword(false)
            setForgotPasswordEmail('')
          }}
          initialEmail={forgotPasswordEmail}
        />
      </>
    )
  }

  return (
    <div className="h-screen bg-dark-bg flex flex-col overflow-hidden">
      <Header 
        onLoginClick={() => setShowLoginModal(true)}
        onProfileClick={() => setShowProfileModal(true)}
        onManageUsersClick={() => setShowManageUsers(true)}
      />
      
      {/* Navigation Cards - Fixed width container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full flex-shrink-0">
        <div className="animate-fade-in">
          <NavigationCards />
        </div>
      </div>

      {/* Main Content - Full width */}
      <main className="flex-1 overflow-auto min-h-0">
        <Routes>
          {/* Home/Registration page */}
          <Route path="/" element={
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <FullWeekView
                isOpen={true}
                onClose={() => {}}
                weekOffset={weekOffset}
                onWeekChange={handleWeekChange}
                refreshTrigger={refreshTrigger}
                onCellClick={handleCellClick}
                embedded={true}
                onDataChange={handleDataChange}
              />
              {/* Spacing below table */}
              <div className="h-12 sm:h-16"></div>
            </div>
          } />

          {/* Workout Plan page */}
          <Route path="/workout-plan" element={
            <div className="h-full overflow-auto px-4 sm:px-6 lg:px-8 pb-4">
              <WorkoutPlanUser />
            </div>
          } />

          {/* Nutrition Tracking page */}
          <Route path="/nutrition-tracking" element={
            <div className="h-full overflow-auto px-4 sm:px-6 lg:px-8 pb-4">
              <NutritionTracking />
            </div>
          } />

          {/* My Workouts page */}
          <Route path="/my-workouts" element={
            <div className="h-full overflow-auto px-4 sm:px-6 lg:px-8 pb-4">
              <div className="max-w-7xl mx-auto">
                <MyWorkouts 
                  refreshTrigger={refreshTrigger}
                  onDataChange={handleDataChange}
                />
              </div>
            </div>
          } />

          {/* Workout Archive page */}
          <Route path="/workout-archive" element={
            <div className="h-full overflow-auto px-4 sm:px-6 lg:px-8 pb-4">
              <WorkoutArchive />
            </div>
          } />
        </Routes>
      </main>

      {/* Modals */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
      
      <RegistrationModal
        isOpen={showRegistrationForm}
        onClose={handleCloseRegistrationForm}
        selectedDate={selectedDate}
        initialStartTime={selectedTime.startTime}
        initialEndTime={selectedTime.endTime}
        onSuccess={handleDataChange}
        editingRegistration={editingRegistration}
      />

      <ManageUsers
        isOpen={showManageUsers}
        onClose={() => setShowManageUsers(false)}
      />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

// Auto-deploy test at 14:25:55
