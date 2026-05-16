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
      <nav className="bg-white border-b border-gray-200 no-print">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-6">
              <button
                onClick={() => onTabChange('learn')}
                className="flex items-center gap-2 text-sm font-bold text-navy-500 hover:text-navy-600 tracking-tight"
              >
                <span className="w-6 h-6 rounded bg-navy-500 text-white flex items-center justify-center text-[10px] font-bold">HA</span>
                <span className="hidden sm:inline">Hallucination Autopsy</span>
              </button>
              <div className="flex gap-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-all duration-150 ${
                      activeTab === tab.id
                        ? 'bg-navy-500 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAboutPanel(true)}
                className="text-[10px] text-gray-400 underline hover:text-gray-600 hidden sm:inline"
              >
                About
              </button>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-navy-400 to-navy-600 border-2 border-navy-200 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />
                    ) : (
                      user?.name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                    <div className="px-3 py-1.5 text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
                      {user ? user.name || user.email : 'Not signed in'}
                    </div>
                    <button onClick={() => { setShowDropdown(false); onNavigate('account') }} className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
                      Account
                    </button>
                    <button onClick={() => { setShowDropdown(false); onNavigate('skill-profile') }} className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
                      Skill Profile
                    </button>
                    <button onClick={() => { setShowDropdown(false); onNavigate('session-archive') }} className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
                      Session Archive
                    </button>
                    <hr className="my-1 border-gray-100" />
                    {user ? (
                      <button onClick={() => { setShowDropdown(false); onLogout() }} className="block w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">
                        Logout
                      </button>
                    ) : (
                      <button onClick={() => { setShowDropdown(false); onNavigate('login') }} className="block w-full text-left px-3 py-1.5 text-xs text-navy-600 hover:bg-navy-50">
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
