import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar/Navbar'
import Dashboard from './pages/Dashboard/Dashboard'
import Transactions from './pages/Transactions/Transactions'
import AddTransaction from './pages/AddTransaction/AddTransaction'
import Budget from './pages/Budget/Budget'
import Analytics from './pages/Analytics/Analytics'
import Auth from './pages/Auth/Auth'

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return children
}

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="app-layout">
      {user && <Navbar />}
      <Routes>
        {/* Public route */}
        <Route
          path="/auth"
          element={user ? <Navigate to="/dashboard" replace /> : <Auth />}
        />

        {/* Protected routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/transactions/new" element={<ProtectedRoute><AddTransaction /></ProtectedRoute>} />
        <Route path="/budget" element={<ProtectedRoute><Budget /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}

export default App
