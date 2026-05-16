const KEYS = {
  SKILL_PROFILE: 'ha_skill_profile',
  SESSIONS: 'ha_sessions',
  REPORTS: 'ha_reports',
  INTRO_DISMISSED: 'ha_intro_dismissed',
}

function read(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function write(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // localStorage full or unavailable
  }
}

export function getSkillProfile() {
  return read(KEYS.SKILL_PROFILE) || null
}

export function saveSkillProfile(profile) {
  write(KEYS.SKILL_PROFILE, profile)
}

export function getSessions() {
  return read(KEYS.SESSIONS) || []
}

export function saveSessions(sessions) {
  write(KEYS.SESSIONS, sessions)
}

export function addSession(session) {
  const sessions = getSessions()
  sessions.unshift(session)
  saveSessions(sessions)
  return sessions
}

export function getReports() {
  return read(KEYS.REPORTS) || []
}

export function addReport(report) {
  const reports = getReports()
  reports.push({
    ...report,
    timestamp: new Date().toISOString(),
  })
  write(KEYS.REPORTS, reports)
  return reports
}

export function getReportCountForExplanation(scenarioId, errorId) {
  const reports = getReports()
  return reports.filter(r => r.scenarioId === scenarioId && r.errorId === errorId).length
}

export function isIntroDismissed() {
  return !!read(KEYS.INTRO_DISMISSED)
}

export function dismissIntro() {
  write(KEYS.INTRO_DISMISSED, true)
}

export function resetAllData() {
  Object.values(KEYS).forEach(k => {
    try { localStorage.removeItem(k) } catch {}
  })
}
