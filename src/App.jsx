import { useEffect } from 'react'
import useUiStore from './state/useUiStore.js'
import AppShell from './layout/AppShell.jsx'

export default function App() {
  const theme = useUiStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return <AppShell />
}
