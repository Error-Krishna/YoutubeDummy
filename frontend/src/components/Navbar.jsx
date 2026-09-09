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
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="page-container flex h-16 items-center justify-between">

        {/* Brand */}
        <Link
          to="/"
          className="group flex items-center gap-2.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-extrabold text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            T
          </span>

          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Tube<span className="text-indigo-600">Soft</span>
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Link
                to="/upload"
                className="hidden items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md sm:flex"
              >
                <span className="text-base leading-none">+</span>
                Upload
              </Link>

              <Link
                to="/dashboard"
                className="hidden rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 md:block"
              >
                Dashboard
              </Link>

              {/* Profile menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-xl p-1.5 pr-2 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-50"
                  aria-expanded={menuOpen}
                >
                  <img
                    src={user.avatar}
                    alt={user.fullname}
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                  />

                  <span className="hidden max-w-28 truncate text-sm font-semibold text-slate-700 lg:block">
                    {user.fullname}
                  </span>

                  <svg
                    className={`hidden h-4 w-4 text-slate-400 transition-transform lg:block ${
                      menuOpen ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl shadow-slate-900/10">

                    {/* User info */}
                    <div className="border-b border-slate-100 px-4 pb-3 pt-2">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {user.fullname}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        @{user.username}
                      </p>
                    </div>

                    <div className="p-1.5">
                      <Link
                        to={`/c/${user.username}`}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        My Channel
                      </Link>

                      <Link
                        to="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700 md:hidden"
                      >
                        Dashboard
                      </Link>

                      <Link
                        to="/playlists"
                        onClick={() => setMenuOpen(false)}
                        className="flex rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        Playlists
                      </Link>

                      <Link
                        to="/liked-videos"
                        onClick={() => setMenuOpen(false)}
                        className="flex rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        Liked Videos
                      </Link>

                      <Link
                        to="/history"
                        onClick={() => setMenuOpen(false)}
                        className="flex rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        Watch History
                      </Link>

                      <Link
                        to="/subscriptions"
                        onClick={() => setMenuOpen(false)}
                        className="flex rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        Subscriptions
                      </Link>

                      <Link
                        to="/tweets"
                        onClick={() => setMenuOpen(false)}
                        className="flex rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        Tweets
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setMenuOpen(false)}
                        className="flex rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        Settings
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 p-1.5">
                      <button
                        onClick={handleLogout}
                        className="flex w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
