import type { ReactNode } from 'react'
import { Navigation, NAV_HEIGHT } from './Navigation'
import { Footer } from './Footer'

interface Props {
  children: ReactNode
  hideFooter?: boolean
  /** Home-style hero pages: nav starts transparent over the hero and the hero owns its own top spacing. */
  transparentNav?: boolean
}

export function PageShell({ children, hideFooter = false, transparentNav = false }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-warm-canvas">
      <Navigation transparentAtTop={transparentNav} />
      <main className="flex-1" style={transparentNav ? undefined : { paddingTop: NAV_HEIGHT }}>
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  )
}
