import type { ReactNode } from 'react'

interface AppTopbarProps {
  left?:  ReactNode
  right?: ReactNode
}

export function AppTopbar({ left, right }: AppTopbarProps) {
  return (
    <header
      style={{
        height:          'var(--topbar-height)',
        borderBottom:    '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'space-between',
        padding:         '0 24px',
        flexShrink:      0,
        position:        'sticky',
        top:             0,
        zIndex:          10,
        boxShadow:       '0 1px 0 var(--color-border)',
      }}
    >
      {/* Left — breadcrumb / page context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        {left}
      </div>

      {/* Right — search and actions */}
      {right && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {right}
        </div>
      )}
    </header>
  )
}
