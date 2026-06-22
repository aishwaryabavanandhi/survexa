/**
 * components/ui/Input.jsx — Dark-mode aware, animated input
 */
export default function Input({
  id,
  name,
  label,
  type         = 'text',
  placeholder,
  value,
  onChange,
  error,
  hint,
  required,
  disabled,
  autoComplete,
  icon,
  className    = '',
  ...rest
}) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-[var(--sf-text-secondary)] mb-1.5"
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input data-testid="input-elt-10"
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className={`input ${icon ? 'pl-9' : ''} ${error ? 'error' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...rest}
        />
      </div>

      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-[var(--sf-text-muted)]">{hint}</p>
      )}
    </div>
  )
}
