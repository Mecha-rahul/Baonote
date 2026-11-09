import { useEffect, useState } from 'react'
import useUiStore from './state/useUiStore.js'
import AppShell from './layout/AppShell.jsx'
import AuthPage from './pages/AuthPage.jsx'
import { setUnauthorizedHandler } from './api/axios.js'

export default function App() {
  const theme = useUiStore((s) => s.theme)
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('accessToken'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // when the session truly ends (refresh failed), show the login screen
  useEffect(() => {
    setUnauthorizedHandler(() => setLoggedIn(false))
  }, [])

  return loggedIn ? <AppShell /> : <AuthPage onAuthSuccess={() => setLoggedIn(true)} />
}