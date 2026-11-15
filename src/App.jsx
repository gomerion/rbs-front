import { useEffect } from 'react'
import AuthProvider from './auth/AuthProvider'
import { useAuth } from './auth/context'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'

function Router() {
  const { status } = useAuth()

  useEffect(() => {
    if (status === 'loading') {
      return
    }
    const target = status === 'authenticated' ? '/' : '/login'
    if (window.location.pathname !== target) {
      window.history.replaceState(null, '', target)
    }
  }, [status])

  if (status === 'loading') {
    return (
      <main className="auth">
        <p className="card__subtitle">Загрузка…</p>
      </main>
    )
  }

  return status === 'authenticated' ? <HomePage /> : <AuthPage />
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}
