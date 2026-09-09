import { Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setMenuOpen(false)
    await logout()
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-6xl">
        <Link to="/" className="text-2xl font-bold text-softPrimary">
          TubeSoft
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/upload" className="text-sm text-softPrimary hover:underline">Upload</Link>
              <Link to="/dashboard" className="text-sm text-softPrimary hover:underline hidden sm:inline">Dashboard</Link>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((open) => !open)}
                  className="flex items-center gap-2"
                >
                  <img
                    src={user.avatar}
                    alt={user.fullname}
                    className="w-8 h-8 rounded-full object-cover border"
                  />
                  <span className="text-sm hidden sm:inline">{user.fullname}</span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg w-48 py-1 z-50">
                    <Link to={`/c/${user.username}`} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">
                      My Channel
                    </Link>
                    <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50 sm:hidden">
                      Dashboard
                    </Link>
                    <Link to="/playlists" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">
                      Playlists
                    </Link>
                    <Link to="/liked-videos" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">
                      Liked Videos
                    </Link>
                    <Link to="/history" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">
                      Watch History
                    </Link>
                    <Link to="/subscriptions" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">
                      Subscriptions
                    </Link>
                    <Link to="/tweets" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">
                      Tweets
                    </Link>
                    <Link to="/settings" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 border-t"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-softPrimary hover:underline">Login</Link>
              <Link to="/register" className="text-sm text-softPrimary hover:underline">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
