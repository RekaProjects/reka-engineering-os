import type { ChangeEventHandler } from 'react'

interface FilterSelectOption {
  value: string
  label: string
}

interface FilterSelectProps {
  name:           string
  defaultValue?:  string
  options:        FilterSelectOption[]
  placeholder?:   string
  onChange?:      ChangeEventHandler<HTMLSelectElement>
  'aria-label'?:  string
}

/**
 * FilterSelect — a standardised <select> for FilterBar rows.
 * Consistent sizing, border, and focus treatment across all list pages.
 */
export function FilterSelect({
  name,
  defaultValue = '',
  options,
  placeholder,
  onChange,
  'aria-label': ariaLabel,
}: FilterSelectProps) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      onChange={onChange}
      aria-label={ariaLabel}
      style={{
        padding:         '7px 10px',
        border:          '1px solid var(--color-border)',
        borderRadius:    'var(--radius-control)',
        fontSize:        '0.8125rem',
        backgroundColor: 'var(--color-surface)',
        color:           'var(--color-text-primary)',
        outline:         'none',
        cursor:          'pointer',
        minWidth:        '140px',
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
