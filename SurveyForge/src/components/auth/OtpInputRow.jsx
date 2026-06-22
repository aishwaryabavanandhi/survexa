/**
 * Shared 6-digit OTP input row (pastel Survexa auth)
 */
import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

export const OTP_LENGTH = 6
export const OTP_TTL_SEC = 300
export const RESEND_COOLDOWN = 60

export default function OtpInputRow({
  otp,
  setOtp,
  onChangeDigit,
  onKeyDown,
  onPaste,
  disabled,
  error,
  shake,
}) {
  const inputs = useRef([])

  useEffect(() => {
    if (shake) inputs.current[0]?.focus()
  }, [shake])

  return (
    <motion.div
      className="flex gap-3 justify-center"
      onPaste={onPaste}
      animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {otp.map((digit, idx) => (
        <input data-testid="input-elt-7"
          key={idx}
          ref={(el) => { inputs.current[idx] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => onChangeDigit(idx, e.target.value, inputs)}
          onKeyDown={(e) => onKeyDown(idx, e, inputs)}
          disabled={disabled}
          className={`
            w-12 h-14 text-center text-xl font-bold border-2 rounded-xl
            focus:outline-none focus:ring-2 focus:ring-[var(--sf-primary)] transition-all
            ${error ? 'border-red-300 bg-red-50' :
              digit ? 'border-[var(--sf-primary)] bg-[var(--sf-primary-soft)]' :
              'border-[var(--sf-border)] bg-white'}
          `}
        />
      ))}
    </motion.div>
  )
}
