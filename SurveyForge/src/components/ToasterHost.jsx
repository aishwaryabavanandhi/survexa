import { Toaster } from 'react-hot-toast'
import { useMediaQuery } from '../hooks/useMediaQuery'

export default function ToasterHost() {
  const isLg = useMediaQuery('(min-width: 1024px)')

  return (
    <Toaster
      position={isLg ? 'top-right' : 'bottom-center'}
      gutter={isLg ? 12 : 10}
      containerStyle={
        isLg
          ? { top: 20, right: 20 }
          : {
              bottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))',
              left: 12,
              right: 12,
            }
      }
      toastOptions={{
        duration: 4000,
        style: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '0.875rem',
          fontWeight: '500',
          borderRadius: '0.875rem',
          boxShadow: '0 10px 40px -8px rgba(0,0,0,0.25)',
          padding: '12px 16px',
        },
        success: {
          iconTheme: { primary: '#22c55e', secondary: '#fff' },
          style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#fff' },
          style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
        },
        loading: {
          style: { background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' },
        },
      }}
    />
  )
}
