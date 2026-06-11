export default function Card({
  children,
  className = '',
  header,
  footer,
  padding = true,
  glass = true,
  hover = false,
}) {
  const base = glass ? 'glass-card' : 'card'
  return (
    <div className={`${base} ${hover ? 'card-hover' : ''} ${className}`}>
      {header && (
        <div className="px-6 py-4 border-b border-[var(--sf-border)] font-semibold text-[var(--sf-text)] text-sm">
          {header}
        </div>
      )}
      <div className={padding ? 'p-6' : ''}>{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-[var(--sf-border)] bg-[var(--sf-bg-subtle)] rounded-b-[20px] text-sm text-[var(--sf-text-secondary)]">
          {footer}
        </div>
      )}
    </div>
  )
}
