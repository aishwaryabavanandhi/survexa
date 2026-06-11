import { useState, useMemo } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import TopBar  from '../components/TopBar'
import MobileBottomNav from '../components/mobile/MobileBottomNav'
import { useMediaQuery } from '../hooks/useMediaQuery'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.18 } },
}

export default function DashboardLayout() {
  const isLg = useMediaQuery('(min-width: 1024px)')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()

  const effectiveSidebarOpen = isLg || sidebarOpen

  const mainPaddingClass = useMemo(
    () => (isLg ? 'p-6' : 'px-4 pt-4 pb-28 sm:pb-24'),
    [isLg]
  )

  return (
    <div className="app-shell flex h-[100dvh] overflow-hidden">
      {/* Sidebar — desktop always visible; mobile overlay */}
      <Sidebar open={effectiveSidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area — min-h-0 lets the scroll container shrink inside the flex column */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen((o) => !o)} />

        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden main-canvas scroll-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`${mainPaddingClass} max-w-[1600px] mx-auto w-full text-[var(--sf-text)]`}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {!isLg && <MobileBottomNav />}
    </div>
  )
}
