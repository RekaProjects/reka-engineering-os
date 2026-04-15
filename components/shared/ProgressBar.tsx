interface ProgressBarProps {
  value: number       // 0–100
  height?: number     // px, defaults to 6
  className?: string
}

export function ProgressBar({ value, height = 6, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))

  // Color logic: 0 = neutral, <50 = blue, <80 = blue, >=80 = green, 100 = green
  let fillColor = 'var(--color-neutral)'
  if (clamped > 0 && clamped < 100) fillColor = 'var(--color-primary)'
  if (clamped === 100) fillColor = 'var(--color-success)'

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: `${height}px`,
        backgroundColor: 'var(--color-surface-subtle)',
        borderRadius: `${height / 2}px`,
        overflow: 'hidden',
      }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${clamped}% complete`}
    >
      <div
        style={{
          width: `${clamped}%`,
          height: '100%',
          backgroundColor: fillColor,
          borderRadius: `${height / 2}px`,
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  )
}
