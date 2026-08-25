import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { useReducedMotion } from '../../../hooks/useReducedMotion'

const NAV_SECTIONS: { label: string; links: { to: string; label: string; icon: string }[] }[] = [
  {
    label: 'Overview',
    links: [{ to: '/admin', label: 'Dashboard', icon: '📊' }],
  },
  {
    label: 'Operations',
    links: [
      { to: '/admin/orders', label: 'Orders', icon: '🧾' },
      { to: '/admin/menu', label: 'Menu', icon: '🍔' },
      { to: '/admin/categories', label: 'Categories', icon: '🗂️' },
    ],
  },
  {
    label: 'People',
    links: [
      { to: '/admin/customers', label: 'Customers', icon: '👥' },
      { to: '/admin/delivery-partners', label: 'Delivery Partners', icon: '🛵' },
    ],
  },
  {
    label: 'Growth',
    links: [
      { to: '/admin/offers', label: 'Offers', icon: '🎟️' },
      { to: '/admin/rewards', label: 'Rewards', icon: '⭐' },
      { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
    ],
  },
  {
    label: 'System',
    links: [{ to: '/admin/settings', label: 'Settings', icon: '⚙️' }],
  },
]

export function AdminSidebar({ open }: { open: boolean }) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.aside
      initial={false}
      animate={{ width: open ? 256 : 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.25, ease: 'easeInOut' }}
      className="sticky top-0 hidden h-screen shrink-0 overflow-hidden border-r border-admin-border bg-admin-bg lg:block"
    >
      <div className="flex h-full w-64 flex-col overflow-y-auto p-5 text-admin-text">
        <div className="flex items-center gap-1.5 font-display text-lg uppercase tracking-tight">
          <span aria-hidden>🌶️</span>
          Spicy<span className="text-admin-orange-bright">Eat</span>
        </div>
        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-admin-muted">Admin Panel</p>

        <nav className="mt-8 flex flex-1 flex-col gap-6" aria-label="Admin navigation">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="mb-2 px-2.5 text-[10px] font-bold uppercase tracking-wide text-admin-muted">
                {section.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {section.links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/admin'}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-admin-orange text-white shadow-[0_0_16px_rgba(255,107,44,0.35)]'
                          : 'text-admin-text2 hover:bg-white/5 hover:text-admin-text'
                      }`
                    }
                  >
                    <span aria-hidden>{link.icon}</span>
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </motion.aside>
  )
}
