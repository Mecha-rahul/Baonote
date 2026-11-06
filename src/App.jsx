import { useEffect, useState } from 'react'
import useUiStore from './state/useUiStore.js'
import AppShell from './layout/AppShell.jsx'
import AuthPage from './pages/AuthPage.jsx'

export default function App() {
  const theme = useUiStore((s) => s.theme)
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('accessToken'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return loggedIn ? <AppShell /> : <AuthPage onAuthSuccess={() => setLoggedIn(true)} />
}