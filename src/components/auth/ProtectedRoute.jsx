import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen font-sans text-metro-muted">
        Carregando...
      </div>
    )
  }
  if (!session) return <Navigate to="/login" replace />
  return children
}
