import type { ElementType, ReactNode } from 'react'

interface Props {
  lines: ReactNode[]
  as?: ElementType
  size?: 'lg' | 'md' | 'sm'
  align?: 'left' | 'center'
  accentLine?: number
  className?: string
}

const sizeClasses = {
  lg: 'text-6xl sm:text-7xl lg:text-8xl',
  md: 'text-4xl sm:text-5xl lg:text-6xl',
  sm: 'text-3xl sm:text-4xl',
}

/** Stacked huge Anton display lines with one line callable out in sun-orange. */
export function EditorialHeading({
  lines,
  as: Tag = 'h1',
  size = 'lg',
  align = 'left',
  accentLine,
  className = '',
}: Props) {
  return (
    <Tag
      className={`font-display uppercase leading-[0.92] tracking-tight ${sizeClasses[size]} ${
        align === 'center' ? 'text-center' : 'text-left'
      } ${className}`}
    >
      {lines.map((line, i) => (
        <span key={i} className={`block ${i === accentLine ? 'text-sun-orange' : ''}`}>
          {line}
        </span>
      ))}
    </Tag>
  )
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-xs font-bold uppercase tracking-[0.2em] text-sun-orange ${className}`}>
      {children}
    </p>
  )
}
