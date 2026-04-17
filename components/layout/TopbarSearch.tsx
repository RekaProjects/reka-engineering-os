'use client'

import { useState, useRef, useEffect, useCallback, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function TopbarSearch() {
  const [value,   setValue]   = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router   = useRouter()

  // Press '/' anywhere outside a text field → focus the search input
  const handleGlobalKeydown = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName
    if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
      e.preventDefault()
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeydown)
    return () => document.removeEventListener('keydown', handleGlobalKeydown)
  }, [handleGlobalKeydown])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const q = value.trim()
    if (q.length >= 2) {
      router.push(`/search?q=${encodeURIComponent(q)}`)
    }
  }

  const handleInputKeydown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setValue('')
      inputRef.current?.blur()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Global search"
      className="flex items-center"
    >
      <div className="relative flex items-center">
        <Search
          size={14}
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute left-2.5 transition-colors duration-100',
            focused ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
          )}
        />
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleInputKeydown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search…  /"
          aria-label="Search across all records"
          autoComplete="off"
          spellCheck={false}
          className={cn(
            'h-8 rounded-[var(--radius-control)] border bg-[var(--color-surface)] py-1.5 pl-8 pr-2.5 text-[0.8125rem] text-[var(--color-text-primary)] outline-none transition-[border-color,width] duration-150 placeholder:text-[var(--color-text-muted)]',
            focused
              ? 'w-[260px] border-[var(--color-primary)] ring-[3px] ring-[var(--color-primary)]/10'
              : 'w-[220px] border-[var(--color-border)]'
          )}
        />
      </div>
    </form>
  )
}
