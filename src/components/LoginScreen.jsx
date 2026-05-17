import { useState } from 'react'
import { signInWithGoogle } from '../utils/firebase'

export default function LoginScreen({ onBack, onLogin }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const user = await signInWithGoogle()
      if (user) {
        onLogin(user)
      }
    } catch (err) {
      if (err.code === 'auth/operation-not-supported' || err.code === 'auth/unauthorized-entity') {
        // Firebase not configured - use demo mode
        const demoUser = {
          uid: 'demo-' + Date.now(),
          name: 'Demo User',
          email: 'demo@hallucination-autopsy.local',
          photoURL: null,
        }
        onLogin(demoUser)
      } else {
        setError(err.message || 'Authentication failed. You can continue in demo mode.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDemoMode = () => {
    const demoUser = {
      uid: 'demo-' + Date.now(),
      name: 'Demo User',
      email: 'demo@hallucination-autopsy.local',
      photoURL: null,
    }
    onLogin(demoUser)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="glass-panel p-8 text-center">
        <h1 className="text-lg font-semibold text-navy-500 mb-2">Hallucination Autopsy</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to track your progress across sessions.</p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="btn-secondary w-full flex items-center justify-center gap-3 py-2.5 mb-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>

        <div className="relative mb-3">
          <div className="absolute inset-0 flex items-center"><div className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} /></div>
          <div className="relative flex justify-center"><span className="px-2 text-xs" style={{ color: 'var(--glass-muted)', background: 'transparent' }}>or</span></div>
        </div>

        <button
          onClick={handleDemoMode}
          className="w-full px-4 py-2 btn-secondary text-xs"
        >
          Continue in Demo Mode (local data only)
        </button>

        {error && (
          <div className="mt-3 p-2 rounded text-xs" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', color: 'var(--glass-warning)' }}>{error}</div>
        )}

        <button onClick={onBack} className="mt-4 text-xs text-gray-400 underline hover:text-gray-600">
          Back
        </button>
      </div>
    </div>
  )
}
