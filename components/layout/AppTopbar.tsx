import type { ReactNode } from 'react'

interface AppTopbarProps {
  left?:  ReactNode
  right?: ReactNode
}

/**
 * AppTopbar — sticky top shell. Slightly taller (56px) to match the sidebar
 * brand area; uses a single hairline border instead of a shadow drop so
 * the scroll region below reads as one continuous surface.
 */
export function AppTopbar({ left, right }: AppTopbarProps) {
  return (
    <header
      className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6"
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
