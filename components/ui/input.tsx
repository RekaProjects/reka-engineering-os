import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        data-slot="input"
        type={type}
        className={cn(
          "flex h-8 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[0.8125rem] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] transition-colors",
          "focus-visible:outline-none focus-visible:border-[var(--color-primary)] focus-visible:ring-[3px] focus-visible:ring-[var(--color-primary)]/10",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
