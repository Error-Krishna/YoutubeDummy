import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-mint-soft">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-mint/30 border-t-mint" />
          </div>
          <p className="mt-4 text-sm font-medium text-ink-dim">
            Loading your account...
          </p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}
