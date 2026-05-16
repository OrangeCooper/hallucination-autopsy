import { initializeApp, getApps } from 'firebase/app'
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'

const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

let app = null
let auth = null

function getFirebaseApp() {
  if (getApps().length === 0) {
    if (!FIREBASE_CONFIG.apiKey) {
      return null
    }
    app = initializeApp(FIREBASE_CONFIG)
  }
  return app || getApps()[0]
}

function getFirebaseAuth() {
  if (!auth) {
    const app = getFirebaseApp()
    if (!app) return null
    auth = getAuth(app)
  }
  return auth
}

export async function signInWithGoogle() {
  const auth = getFirebaseAuth()
  if (!auth) {
    throw { code: 'auth/operation-not-supported', message: 'Firebase not configured' }
  }
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  const result = await signInWithPopup(auth, provider)
  const user = result.user
  return {
    uid: user.uid,
    name: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  }
}

export async function logoutUser() {
  const auth = getFirebaseAuth()
  if (auth) {
    await signOut(auth)
  }
}

export function onAuthChange(callback) {
  const auth = getFirebaseAuth()
  if (!auth) {
    callback(null)
    return () => {}
  }
  return auth.onAuthStateChanged(user => {
    if (user) {
      callback({
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      })
    } else {
      callback(null)
    }
  })
}
