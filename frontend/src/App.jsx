import { Routes, Route, Navigate } from 'react-router-dom'
import TopNav from './components/TopNav'
import AIChatbot from './components/AIChatbot'
import SavedEvents from './pages/SavedEvents'
import LayspanDashboard from './pages/LayspanDashboard'
import { useAuth } from './context/AuthContext'
import SignIn from './pages/SignIn'
import Profile from './pages/Profile'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <div className="bg-hero min-h-screen">
      <TopNav />
      <Routes>
        <Route path="/" element={<LayspanDashboard />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/saved-events" element={<SavedEvents />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* AI Chatbot - Available on all pages */}
      <AIChatbot />
    </div>
  )
}
