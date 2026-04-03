import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FcGoogle } from 'react-icons/fc'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

function Auth() {
  const navigate = useNavigate()
  const { signInWithGoogle, loginWithEmail, signUpWithEmail } = useAuth()

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Handle Google sign-in
  async function handleGoogleSignIn() {
    setIsLoading(true)
    try {
      await signInWithGoogle()
      toast.success('Signed in successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.message || 'Failed to sign in with Google')
    }
    setIsLoading(false)
  }

  // Handle email auth
  async function handleEmailAuth(e) {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    try {
      if (isLogin) {
        await loginWithEmail(email, password)
        toast.success('Logged in successfully!')
      } else {
        await signUpWithEmail(email, password)
        toast.success('Account created successfully!')
      }
      navigate('/dashboard')
    } catch (error) {
      let msg = 'Authentication failed'
      if (error.code === 'auth/user-not-found') msg = 'No account found with this email'
      else if (error.code === 'auth/wrong-password') msg = 'Incorrect password'
      else if (error.code === 'auth/email-already-in-use') msg = 'Email already registered'
      else if (error.code === 'auth/invalid-email') msg = 'Invalid email address'
      else if (error.code === 'auth/invalid-credential') msg = 'Invalid credentials'
      toast.error(msg)
    }
    setIsLoading(false)
  }

  return (
    <div className="auth-page" id="auth-page">
      {/* Background decoration */}
      <div className="auth-bg-glow auth-bg-glow--1" />
      <div className="auth-bg-glow auth-bg-glow--2" />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Brand */}
        <div className="auth-brand">
          <span className="auth-brand-icon">◈</span>
          <h1 className="auth-brand-name">FinTrack</h1>
          <p className="auth-tagline">Your personal finance companion</p>
        </div>

        {/* Google Sign-In */}
        <button
          className="auth-google-btn"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          id="google-signin-btn"
        >
          <FcGoogle className="google-icon" />
          Continue with Google
        </button>

        <div className="auth-divider">
          <span>or</span>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} className="auth-form">
          <div className="auth-input-group">
            <MdEmail className="auth-input-icon" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="auth-input"
              id="email-input"
            />
          </div>

          <div className="auth-input-group">
            <MdLock className="auth-input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="auth-input"
              id="password-input"
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
            id="auth-submit-btn"
          >
            {isLoading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle Login/Signup */}
        <p className="auth-toggle">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            className="auth-toggle-btn"
            onClick={() => setIsLogin(!isLogin)}
            id="auth-toggle-btn"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  )
}

export default Auth
