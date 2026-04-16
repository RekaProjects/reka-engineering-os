import type { ReactNode } from 'react'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { formatDate } from '@/lib/utils/formatters'

interface EntityStatusStripProps {
  statusBadge:     ReactNode
  priorityBadge?:  ReactNode
  extraBadge?:     ReactNode
  dueDate?:        string | null
  progress?:       number | null
}

/**
 * EntityStatusStrip — a contained status hero strip for detail pages.
 * Sits between the PageHeader and the tab navigation.
 * Shows status, priority, optional extra badge, due date, and progress.
 */
export function EntityStatusStrip({
  statusBadge,
  priorityBadge,
  extraBadge,
  dueDate,
  progress,
}: EntityStatusStripProps) {
  const today    = new Date().toISOString().split('T')[0]
  const isOverdue = dueDate && dueDate < today

  return (
    <div
      style={{
        display:         'flex',
        alignItems:      'center',
        gap:             '12px',
        flexWrap:        'wrap',
        padding:         '10px 16px',
        backgroundColor: 'var(--color-surface)',
        border:          '1px solid var(--color-border)',
        borderRadius:    'var(--radius-card)',
        marginBottom:    '20px',
        boxShadow:       'var(--shadow-sm)',
      }}
    >
      {statusBadge}

      {priorityBadge}

      {extraBadge}

      {dueDate && (
        <span
          style={{
            fontSize:   '0.75rem',
            fontWeight: isOverdue ? 600 : 400,
            color:      isOverdue ? 'var(--color-danger)' : 'var(--color-text-muted)',
            whiteSpace: 'nowrap',
          }}
        >
          Due {formatDate(dueDate)}
        </span>
      )}

      {progress != null && (
        <div
          style={{
            display:    'flex',
            alignItems: 'center',
            gap:        '6px',
            minWidth:   '110px',
            flex:       '0 0 auto',
          }}
        >
          <ProgressBar value={progress} height={5} />
          <span
            style={{
              fontSize:  '0.6875rem',
              color:     'var(--color-text-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            {progress}%
          </span>
        </div>
      )}
    </div>
  )
}
