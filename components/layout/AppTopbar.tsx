import type { ReactNode } from 'react'

interface AppTopbarProps {
  left?:  ReactNode
  right?: ReactNode
}

export function AppTopbar({ left, right }: AppTopbarProps) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 shadow-[0_1px_0_var(--color-border)] sticky top-0 z-10"
      style={{ height: 'var(--topbar-height)' }}
    >
      {/* Left — breadcrumb / page context */}
      <div className="flex min-w-0 items-center gap-2">
        {left}
      </div>

      {/* Right — search and actions */}
      {right && (
        <div className="flex shrink-0 items-center gap-2.5">
          {right}
        </div>
      )}
    </header>
  )
}
