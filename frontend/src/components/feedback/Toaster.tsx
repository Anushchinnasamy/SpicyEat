import { AnimatePresence, motion } from 'framer-motion'
import { useToastStore, type ToastVariant } from '../../state/toastStore'

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: 'border-herb-green/30 bg-deep-ink text-warm-canvas',
  error: 'border-chili-red/40 bg-chili-red text-warm-canvas',
  info: 'border-deep-ink/15 bg-deep-ink text-warm-canvas',
}

const VARIANT_ICON: Record<ToastVariant, string> = {
  success: '✅',
  error: '🔥',
  info: '🌶️',
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 sm:bottom-8 sm:left-auto sm:right-8 sm:translate-x-0">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={() => dismiss(t.id)}
            className={`pointer-events-auto flex cursor-pointer items-center gap-2 rounded-2xl border px-4 py-3 text-sm shadow-lg ${VARIANT_STYLES[t.variant]}`}
          >
            <span aria-hidden>{VARIANT_ICON[t.variant]}</span>
            <span className="font-medium">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
