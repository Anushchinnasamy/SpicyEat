import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Variant = 'primary' | 'dark' | 'outline' | 'ghost' | 'outline-dark'

interface BaseProps {
  variant?: Variant
  icon?: ReactNode
  children: ReactNode
  className?: string
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-sun-orange text-white hover:bg-chili-red',
  dark: 'bg-deep-ink text-warm-canvas hover:bg-black',
  outline: 'border border-deep-ink/20 text-deep-ink hover:border-deep-ink',
  ghost: 'text-deep-ink hover:bg-deep-ink/5',
  'outline-dark': 'border border-admin-border text-admin-text2 hover:border-admin-orange hover:text-admin-orange-bright',
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 min-h-11 font-sans font-semibold text-sm tracking-wide transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none'

export function Button({
  variant = 'primary',
  icon,
  children,
  className = '',
  ...rest
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${base} ${variantClasses[variant]} ${className}`} {...rest}>
      {children}
      {icon}
    </button>
  )
}

export function LinkButton({
  to,
  variant = 'primary',
  icon,
  children,
  className = '',
}: BaseProps & { to: string }) {
  return (
    <Link to={to} className={`${base} ${variantClasses[variant]} ${className}`}>
      {children}
      {icon}
    </Link>
  )
}
