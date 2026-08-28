import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { performLogout } from '../../api/auth'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { AdminSidebar } from './components/AdminSidebar'
import { AdminHeader } from './components/AdminHeader'

interface Props {
  title: string
  subtitle?: string
  children: ReactNode
}

export function AdminLayout({ title, subtitle, children }: Props) {
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  async function handleLogout() {
    await performLogout()
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-admin-bg text-admin-text">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <AdminSidebar open={sidebarOpen} />
      </motion.div>

      <div className="flex min-w-0 flex-1 flex-col bg-admin-bg2">
        <AdminHeader
          title={title}
          subtitle={subtitle}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onLogout={handleLogout}
        />
        <main className="flex-1 p-6 sm:p-8">{children}</main>
      </div>
    </div>
  )
}
