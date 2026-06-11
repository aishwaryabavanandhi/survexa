/**
 * Country dial-code selector for phone inputs
 */
const COUNTRIES = [
  { code: 'IN', dial: '+91', label: 'India (+91)' },
  { code: 'US', dial: '+1', label: 'United States (+1)' },
  { code: 'GB', dial: '+44', label: 'United Kingdom (+44)' },
  { code: 'AE', dial: '+971', label: 'UAE (+971)' },
  { code: 'SG', dial: '+65', label: 'Singapore (+65)' },
  { code: 'AU', dial: '+61', label: 'Australia (+61)' },
  { code: 'CA', dial: '+1', label: 'Canada (+1)' },
  { code: 'DE', dial: '+49', label: 'Germany (+49)' },
  { code: 'FR', dial: '+33', label: 'France (+33)' },
  { code: 'JP', dial: '+81', label: 'Japan (+81)' },
]

export function formatPhoneWithDial(dial, localNumber) {
  const digits = String(localNumber || '').replace(/\D/g, '')
  if (!digits) return ''
  const d = dial.startsWith('+') ? dial : `+${dial}`
  return `${d}${digits}`
}

export default function CountryCodeSelector({ value, onChange, className = '' }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-xl border border-[var(--sf-border)] bg-white dark:bg-[#1a1f2e] px-3 py-2.5 text-sm font-medium text-[var(--sf-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sf-primary)]/40 ${className}`}
      aria-label="Country code"
    >
      {COUNTRIES.map((c) => (
        <option key={`${c.code}-${c.dial}`} value={c.dial}>
          {c.label}
        </option>
      ))}
    </select>
  )
}

export { COUNTRIES }
