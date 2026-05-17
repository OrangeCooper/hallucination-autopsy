import { useState, useRef, useEffect } from 'react'
import AboutPanel from './AboutPanel'

export default function NavBar({ activeTab, onTabChange, user, onLogout, onNavigate }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showAboutPanel, setShowAboutPanel] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const tabs = [
    { id: 'learn', label: 'LEARN' },
    { id: 'test', label: 'TEST' },
  ]

  return (
    <>
      <nav className="glass-panel rounded-none border-x-0 border-t-0 no-print" style={{ borderRadius: 0, background: 'rgba(10, 15, 30, 0.92)' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-6">
              <button
                onClick={() => onTabChange('learn')}
                className="flex items-center gap-2 text-sm font-bold tracking-tight"
                style={{ color: 'var(--glass-accent)' }}
              >
                <span className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--glass-accent)', color: '#0a0f1e' }}>HA</span>
                <span className="hidden sm:inline">Hallucination Autopsy</span>
              </button>
              <div className="flex gap-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-all duration-150 ${
                      activeTab === tab.id
                        ? 'text-white shadow-sm'
                        : 'text-white/55 hover:text-white hover:bg-white/5'
                    }`}
                    style={activeTab === tab.id ? { background: 'rgba(59, 130, 246, 0.5)' } : {}}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAboutPanel(true)}
                className="text-[10px] underline hidden sm:inline"
                style={{ color: 'var(--glass-muted)' }}
              >
                About
              </button>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 text-sm transition-colors"
                  style={{ color: 'var(--glass-secondary)' }}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #1e3a5f, #0a1628)', border: '2px solid rgba(126,184,247,0.3)' }}>
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />
                    ) : (
                      user?.name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                </button>
                {showDropdown && (
                  <div className="glass-panel-elevated absolute right-0 mt-1.5 w-44 py-1 z-50">
                    <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--glass-muted)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {user ? user.name || user.email : 'Not signed in'}
                    </div>
                    <button onClick={() => { setShowDropdown(false); onNavigate('account') }} className="block w-full text-left px-3 py-1.5 text-xs hover:bg-white/5" style={{ color: 'var(--glass-primary)' }}>
                      Account
                    </button>
                    <button onClick={() => { setShowDropdown(false); onNavigate('skill-profile') }} className="block w-full text-left px-3 py-1.5 text-xs hover:bg-white/5" style={{ color: 'var(--glass-primary)' }}>
                      Skill Profile
                    </button>
                    <button onClick={() => { setShowDropdown(false); onNavigate('session-archive') }} className="block w-full text-left px-3 py-1.5 text-xs hover:bg-white/5" style={{ color: 'var(--glass-primary)' }}>
                      Session Archive
                    </button>
                    <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '0.25rem 0' }} />
                    {user ? (
                      <button onClick={() => { setShowDropdown(false); onLogout() }} className="block w-full text-left px-3 py-1.5 text-xs hover:bg-white/5" style={{ color: 'var(--glass-error)' }}>
                        Logout
                      </button>
                    ) : (
                      <button onClick={() => { setShowDropdown(false); onNavigate('login') }} className="block w-full text-left px-3 py-1.5 text-xs hover:bg-white/5" style={{ color: 'var(--glass-accent)' }}>
                        Sign In
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      {showAboutPanel && <AboutPanel onClose={() => setShowAboutPanel(false)} />}
    </>
  )
}
