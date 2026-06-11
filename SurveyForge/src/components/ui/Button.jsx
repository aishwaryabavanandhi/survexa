/**
 * components/ui/Button.jsx — Production-ready button with animations
 */
import { motion } from 'framer-motion'

export default function Button({
  children,
  variant    = 'primary',
  size       = 'md',
  loading    = false,
  disabled   = false,
  fullWidth  = false,
  icon       = null,
  iconRight  = false,
  className  = '',
  type       = 'button',
  onClick,
  ...rest
}) {
  const variants = {
    primary:   'btn-primary',
    secondary: 'btn-secondary',
    ghost:     'btn-ghost',
    danger:    'btn-danger',
  }
  const sizes = {
    xs: 'btn-sm text-xs px-2.5 py-1',
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  }

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      whileTap={disabled || loading ? {} : { scale: 0.97 }}
      className={`btn ${variants[variant] || variants.primary} ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && !iconRight && <span className="shrink-0">{icon}</span>}
          {children}
          {icon && iconRight  && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </motion.button>
  )
}
