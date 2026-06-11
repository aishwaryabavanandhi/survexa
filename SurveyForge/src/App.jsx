import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider }   from './context/AppContext'
import { ThemeProvider } from './context/ThemeContext'
import AppRoutes         from './routes/AppRoutes'
import ToasterHost       from './components/ToasterHost'
import { initPushNotifications } from './utils/notifications'

export default function App() {
  useEffect(() => {
    initPushNotifications()
  }, [])

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppProvider>
          <AppRoutes />

          <ToasterHost />
        </AppProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
