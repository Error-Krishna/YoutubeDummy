import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Redirects to the logged-in user's own channel page, which renders
// the full profile (with edit controls) via ChannelProfile.jsx.
export default function Profile() {
  const { user, loading } = useAuth()

  if (loading) return <div className="py-10 text-center text-ink-dim">Loading...</div>
  if (!user) return <Navigate to="/login" replace />

  return <Navigate to={`/c/${user.username}`} replace />
}
