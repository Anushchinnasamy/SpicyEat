import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  icon?: string
  label?: string
  endAdornment?: ReactNode
  variant?: 'light' | 'dark'
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { icon, label, endAdornment, variant = 'light', className = '', id, ...rest },
  ref,
) {
  const dark = variant === 'dark'

  return (
    <label className="flex flex-col gap-1.5 text-left">
      {label && (
        <span
          className={`text-xs font-semibold uppercase tracking-wide ${dark ? 'text-admin-text2' : 'text-muted-ink'}`}
        >
          {label}
        </span>
      )}
      <span
        className={`flex items-center gap-3 rounded-2xl border pl-3 pr-4 py-2.5 ${
          dark
            ? 'border-admin-border bg-admin-bg2 focus-within:border-admin-orange'
            : 'border-deep-ink/15 bg-white/60 focus-within:border-sun-orange'
        }`}
      >
        {icon && (
          <span
            aria-hidden
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              dark ? 'bg-admin-orange/15 text-admin-orange-bright' : 'bg-sun-orange/10 text-sun-orange'
            }`}
          >
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full min-w-0 bg-transparent py-1 text-sm outline-none ${
            dark ? 'text-admin-text placeholder:text-admin-muted' : 'placeholder:text-muted-ink/60'
          } ${className}`}
          {...rest}
        />
        {endAdornment}
      </span>
    </label>
  )
})
