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
      <nav className="glass-panel rounded-none border-x-0 border-t-0 no-print" style={{ borderRadius: 0, background: 'rgba(255,255,255,0.65)', zIndex: 40, position: 'relative' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-6">
              <button
                onClick={() => onTabChange('learn')}
                className="flex items-center gap-2 text-sm font-bold tracking-tight"
                style={{ color: '#2b5cad' }}
              >
                <span className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold" style={{ background: '#2b5cad', color: '#ffffff' }}>HA</span>
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
                        : 'hover:bg-black/5'
                    }`}
                    style={activeTab === tab.id ? { background: '#2b5cad', color: '#fff' } : { color: '#4a5568' }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAboutPanel(true)}
                className="px-2.5 py-1 text-[10px] font-medium rounded transition-all duration-150 hover:bg-black/5"
                style={{ color: '#4a5568' }}
              >
                About
              </button>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 text-sm transition-colors"
                  style={{ color: '#4a5568' }}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #2b5cad, #1a3a6b)', border: '2px solid rgba(43, 92, 173, 0.3)' }}>
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />
                    ) : (
                      user?.name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                </button>
                {showDropdown && (
                  <div className="glass-panel-elevated absolute right-0 mt-1.5 w-44 py-1" style={{ zIndex: 100 }}>
                    <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider mb-1" style={{ color: '#718096', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                      {user ? user.name || user.email : 'Not signed in'}
                    </div>
                    <button onClick={() => { setShowDropdown(false); onNavigate('account') }} className="block w-full text-left px-3 py-1.5 text-xs hover:bg-black/5" style={{ color: '#2d3748' }}>
                      Account
                    </button>
                    <button onClick={() => { setShowDropdown(false); onNavigate('skill-profile') }} className="block w-full text-left px-3 py-1.5 text-xs hover:bg-black/5" style={{ color: '#2d3748' }}>
                      Skill Profile
                    </button>
                    <button onClick={() => { setShowDropdown(false); onNavigate('session-archive') }} className="block w-full text-left px-3 py-1.5 text-xs hover:bg-black/5" style={{ color: '#2d3748' }}>
                      Session Archive
                    </button>
                    <hr style={{ borderColor: 'rgba(0,0,0,0.08)', margin: '0.25rem 0' }} />
                    <button onClick={() => { setShowDropdown(false); onLogout() }} className="block w-full text-left px-3 py-1.5 text-xs hover:bg-black/5" style={{ color: '#c53030' }}>
                      Logout
                    </button>
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
