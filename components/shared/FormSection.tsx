import type { ReactNode } from 'react'

interface FormSectionProps {
  title:      string
  children:   ReactNode
  first?:     boolean
}

/**
 * FormSection — a titled section separator for create/edit forms.
 * Use `first={true}` on the first section to suppress the top margin.
 */
export function FormSection({ title, children, first = false }: FormSectionProps) {
  return (
    <div style={{ marginTop: first ? 0 : '24px' }}>
      <p
        style={{
          fontSize:      '0.75rem',
          fontWeight:    600,
          color:         'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom:  '12px',
          paddingBottom: '8px',
          borderBottom:  '1px solid var(--color-border)',
        }}
      >
        {title}
      </p>
      {children}
    </div>
  )
}
