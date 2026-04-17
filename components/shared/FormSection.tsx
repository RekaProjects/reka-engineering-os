import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface FormSectionProps {
  title:      string
  children:   ReactNode
  first?:     boolean
  className?: string
}

/**
 * FormSection — a titled section separator for create/edit forms.
 * Use `first={true}` on the first section to suppress the top margin.
 */
export function FormSection({ title, children, first = false, className }: FormSectionProps) {
  return (
    <div className={cn(!first && 'mt-6', className)}>
      <p className="mb-3 border-b border-[var(--color-border)] pb-2 text-xs font-semibold uppercase tracking-[0.05em] text-[var(--color-text-muted)]">
        {title}
      </p>
      {children}
    </div>
  )
}
