import { PanelLeft } from 'lucide-react'
import useUiStore from '../state/useUiStore.js'
import IconBtn from '../components/IconBtn.jsx'
import Breadcrumb from '../components/Breadcrumb.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import UserAvatar from '../components/UserAvatar.jsx'
import UserMenu from '../components/UserMenu.jsx'

/**
 * Floating top bar. Left: sidebar toggle (the only hamburger-style
 * icon, with aria-expanded) + breadcrumb. Right: theme toggle, avatar,
 * and a three-dot "more" menu.
 */
export default function TopBar() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)

  return (
    <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 p-3">
      <div className="flex min-w-0 items-center gap-2">
        <IconBtn
          label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          icon={PanelLeft}
          onClick={toggleSidebar}
          aria-expanded={sidebarOpen}
          variant="solid"
          className="shrink-0"
        />
        <Breadcrumb />
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserAvatar />
        <UserMenu />
      </div>
    </header>
  )
}
