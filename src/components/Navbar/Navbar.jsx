import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdDashboard, MdReceipt, MdSavings, MdAnalytics, MdLogout } from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import './Navbar.css'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <MdDashboard /> },
    { to: '/transactions', label: 'Transactions', icon: <MdReceipt /> },
    { to: '/budget', label: 'Budget', icon: <MdSavings /> },
    { to: '/analytics', label: 'Analytics', icon: <MdAnalytics /> }
  ]

  async function handleLogout() {
    try {
      await logout()
      toast.success('Signed out successfully')
      navigate('/auth')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="navbar-inner">
        {/* Brand */}
        <NavLink to="/dashboard" className="navbar-brand">
          <span className="brand-icon">◈</span>
          <span className="brand-text">FinTrack</span>
        </NavLink>

        {/* Navigation Links */}
        <div className="navbar-links">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link--active' : ''}`
              }
            >
              <span className="nav-link-icon">{link.icon}</span>
              <span className="nav-link-label">{link.label}</span>
            </NavLink>
          ))}
        </div>

        {/* User Info + Logout */}
        {user && (
          <div className="navbar-user">
            {user.photoURL ? (
              <img src={user.photoURL} alt="avatar" className="navbar-avatar" />
            ) : (
              <div className="navbar-avatar-placeholder">
                {(user.displayName || user.email || '?')[0].toUpperCase()}
              </div>
            )}
            <span className="navbar-username">
              {user.displayName || user.email?.split('@')[0]}
            </span>
            <button
              className="btn-icon navbar-logout"
              onClick={handleLogout}
              title="Sign Out"
              id="logout-btn"
            >
              <MdLogout />
            </button>
          </div>
        )}
      </div>
    </motion.nav>
  )
}

export default Navbar
