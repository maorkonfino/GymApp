import { useState, useEffect } from 'react'
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

type ViewMode = 'day' | 'week' | 'workout' | 'tracking' | 'myworkouts'

function AppContent() {
  const { user, login, register } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState({ startTime: '06:00', endTime: '07:00' })
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showManageUsers, setShowManageUsers] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [weekOffset, setWeekOffset] = useState(0)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [editingRegistration, setEditingRegistration] = useState<any>(null)

  // Reset weekOffset to 0 when switching to day view (registration page)
  useEffect(() => {
    if (viewMode === 'day') {
      setWeekOffset(0)
    }
  }, [viewMode])

  const handleWeekChange = (direction: 'prev' | 'next') => {
    setWeekOffset(prev => direction === 'next' ? prev + 1 : prev - 1)
  }

  const handleDataChange = () => {
    // Trigger refresh for all components
    setRefreshTrigger(prev => prev + 1)
  }

  // Scroll to top when changing view mode
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [viewMode])

  // const handleEditRegistration = (registration: any) => {
  //   setEditingRegistration(registration)
  //   setSelectedDate(new Date(registration.date))
  //   setShowRegistrationForm(true)
  // }

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
      <div className="min-h-screen bg-dark-bg flex flex-col">
        <Header 
          onLoginClick={() => setShowLoginModal(true)}
          onProfileClick={() => setShowProfileModal(true)}
          onManageUsersClick={() => setShowManageUsers(true)}
        />
        
        {/* Navigation Cards - Fixed width container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full">
          <div className="animate-fade-in">
            <NavigationCards 
              activeView={viewMode}
              onViewChange={setViewMode}
            />
          </div>
        </div>

        {/* Main Content - Full width */}
        <main className="flex-1 overflow-hidden">
          {viewMode === 'day' && (
            <div className="h-full px-4 sm:px-6 lg:px-8 pb-4">
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
            </div>
          )}

          {viewMode === 'workout' && (
            <div className="h-full overflow-auto px-4 sm:px-6 lg:px-8 pb-4">
              <div className="max-w-7xl mx-auto">
                <WorkoutPlanUser />
              </div>
            </div>
          )}

          {viewMode === 'tracking' && (
            <div className="h-full overflow-auto px-4 sm:px-6 lg:px-8 pb-4">
              <div className="max-w-7xl mx-auto">
                <NutritionTracking />
              </div>
            </div>
          )}

          {viewMode === 'myworkouts' && (
            <div className="h-full overflow-auto px-4 sm:px-6 lg:px-8 pb-4">
              <div className="max-w-7xl mx-auto">
                <MyWorkouts 
                  refreshTrigger={refreshTrigger}
                  onDataChange={handleDataChange}
                />
              </div>
            </div>
          )}
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

