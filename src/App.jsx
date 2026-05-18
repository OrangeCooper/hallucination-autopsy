import { useState, useCallback, useEffect } from 'react'
import NavBar from './components/NavBar'
import LearnMode from './components/LearnMode'
import CaseBriefing from './components/CaseBriefing'
import DocumentReview from './components/DocumentReview'
import AnalysisReport from './components/AnalysisReport'
import SkillProfile from './components/SkillProfile'
import AccountPage from './components/AccountPage'
import TestMode from './components/TestMode'
import LoginScreen from './components/LoginScreen'
import TutorialBanner from './components/TutorialBanner'
import { useSkillProfile } from './hooks/useSkillProfile'
import { scoreParagraphAnnotations } from './utils/annotations'
import { warmUpAPI } from './utils/api'
import { onAuthChange, logoutUser } from './utils/firebase'
import { getSessions, getSkillProfile } from './utils/storage'
import { TUTORIAL_SCENARIO } from './data/tutorialScenario'

export default function App() {
  const [activeTab, setActiveTab] = useState('learn')
  const [screen, setScreen] = useState('learn')
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [lastAnnotations, setLastAnnotations] = useState(null)
  const [currentMode, setCurrentMode] = useState(null)
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [userSessions, setUserSessions] = useState([])
  const { profile, sessions, updateFromSession: updateStoredSession } = useSkillProfile()

  useEffect(() => {
    warmUpAPI()
    const unsub = onAuthChange((fbUser) => {
      if (fbUser) {
        setUser(fbUser)
        setUserProfile(getSkillProfile())
        setUserSessions(getSessions() || [])
      }
    })
    return () => { if (unsub) unsub() }
  }, [])

  const effectiveProfile = userProfile || profile
  const effectiveSessions = userSessions.length > 0 ? userSessions : sessions

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab)
    setSelectedScenario(null)
    setLastAnnotations(null)
    setCurrentMode(null)
    if (tab === 'learn' || tab === 'home') setScreen('learn')
    else if (tab === 'test') setScreen('test')
    if (tab === 'learn' || tab === 'test') warmUpAPI()
  }, [])

  const handleStartScenario = useCallback((scenario, mode) => {
    setSelectedScenario(scenario)
    setCurrentMode(mode || 'static')
    setScreen('case-briefing')
  }, [])

  const handleBeginReview = useCallback(() => {
    setScreen('document-review')
  }, [])

  const handleSubmitReview = useCallback((annotations) => {
    setLastAnnotations(annotations)
    setScreen('analysis-report')
  }, [])

  const handleSaveAndExit = useCallback((rawAnnotations, rawOverrides, analysisIdentifiedSet) => {
    if (selectedScenario && rawAnnotations) {
      const { matchedAnnotations } = scoreParagraphAnnotations(rawAnnotations, selectedScenario.plantedErrors)
      updateStoredSession(selectedScenario, matchedAnnotations, selectedScenario.plantedErrors, currentMode, rawOverrides, analysisIdentifiedSet)
      if (user) {
        setUserProfile(getSkillProfile())
        setUserSessions(getSessions())
      }
    }
    setLastAnnotations(null)
    setSelectedScenario(null)
    setCurrentMode(null)
    setScreen('learn')
    setActiveTab('learn')
  }, [selectedScenario, updateStoredSession, user, currentMode])

  const handleLogin = useCallback((userData) => {
    setUser(userData)
    setUserProfile(getSkillProfile())
    setUserSessions(getSessions() || [])
    handleTabChange('learn')
  }, [handleTabChange])

  const handleLogout = useCallback(async () => {
    try { await logoutUser() } catch {}
    setUser(null)
    setUserProfile(null)
    setUserSessions([])
  }, [])

  const handleNavigate = useCallback((target) => {
    if (target === 'account') {
      setScreen('account')
      setActiveTab('learn')
    } else if (target === 'skill-profile') {
      setScreen('skill-profile')
      setActiveTab('learn')
    } else if (target === 'session-archive') {
      setScreen('account')
      setActiveTab('learn')
    } else if (target === 'login') {
      setScreen('login')
    }
  }, [])

  const handleViewSkillProfile = useCallback(() => {
    setScreen('skill-profile')
    setActiveTab('learn')
  }, [])

  const handleViewSkillProfileInTutorial = useCallback(() => {
    setScreen('skill-profile')
    setActiveTab('learn')
  }, [])

  const handleContinueToTestMode = useCallback(() => {
    setScreen('test')
    setActiveTab('test')
  }, [])

  const handleTutorialExit = useCallback(() => {
    setLastAnnotations(null)
    setSelectedScenario(null)
    setCurrentMode(null)
    setScreen('learn')
    setActiveTab('learn')
  }, [])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'transparent' }}>
      <NavBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={user}
        onLogout={handleLogout}

        onNavigate={handleNavigate}
      />
      <main className="flex-1">
        {currentMode === 'tutorial' && (
          <TutorialBanner currentScreen={screen} onExit={handleTutorialExit} />
        )}

        {screen === 'learn' && (
          <LearnMode
            profile={effectiveProfile}
            sessions={effectiveSessions}
            onStartScenario={handleStartScenario}
            onViewSkillProfile={handleViewSkillProfile}
            isTutorial={currentMode === 'tutorial'}
          />
        )}

        {screen === 'test' && (
          <TestMode
            profile={{ ...effectiveProfile, sessions: effectiveSessions }}
            onStartScenario={handleStartScenario}
            isTutorial={currentMode === 'tutorial'}
            onViewSkillProfile={handleViewSkillProfileInTutorial}
          />
        )}

        {screen === 'case-briefing' && selectedScenario && (
          <CaseBriefing
            scenario={selectedScenario}
            onBegin={handleBeginReview}
            isTutorial={currentMode === 'tutorial'}
          />
        )}

        {screen === 'document-review' && selectedScenario && (
          <DocumentReview
            scenario={selectedScenario}
            onSubmit={handleSubmitReview}
            isTutorial={currentMode === 'tutorial'}
          />
        )}

        {screen === 'analysis-report' && selectedScenario && lastAnnotations && (
          <AnalysisReport
            scenario={selectedScenario}
            annotations={lastAnnotations}
            onBackToDashboard={handleSaveAndExit}
            isTutorial={currentMode === 'tutorial'}
            onViewSkillProfile={handleContinueToTestMode}
          />
        )}

        {screen === 'skill-profile' && (
          <SkillProfile
            profile={effectiveProfile}
            sessions={effectiveSessions}
            onBack={() => { setScreen('learn'); setActiveTab('learn') }}
            isTutorial={currentMode === 'tutorial'}
            onCompleteTour={handleTutorialExit}
          />
        )}

        {screen === 'account' && (
          <AccountPage
            profile={effectiveProfile}
            sessions={effectiveSessions}
            user={user}
            onBack={() => { setScreen('learn'); setActiveTab('learn') }}
          />
        )}

        {screen === 'login' && (
          <LoginScreen
            onBack={() => { setScreen('learn'); setActiveTab('learn') }}
            onLogin={handleLogin}
          />
        )}
      </main>

      <footer className="text-center text-[10px] py-3 px-4 leading-relaxed" style={{ color: 'var(--glass-muted)', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        Hallucination Autopsy contains no real client data. All legal scenarios are entirely fictional and synthetic.
        Nothing on this platform constitutes legal advice. All AI-generated explanations should be independently
        verified against primary legal sources.
      </footer>
    </div>
  )
}
