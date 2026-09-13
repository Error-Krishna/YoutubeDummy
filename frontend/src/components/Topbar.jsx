import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  MenuIcon,
  SearchIcon,
  UploadIcon,
  ChevronDownIcon,
} from './icons'

export default function Topbar({ onToggleSidebar }) {
  const { user, loading, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const menuRef = useRef(null)
  const navigate = useNavigate()

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
    navigate('/')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-base-border bg-base/95 px-3 backdrop-blur sm:gap-4 sm:px-4">
      {/* Left: menu + brand */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-dim transition-colors hover:bg-base-hover hover:text-ink"
          aria-label="Toggle navigation"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint text-base font-bold text-base">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 translate-x-[1px]">
              <path d="M8 5.5v13l11-6.5-11-6.5Z" />
            </svg>
          </span>
          <span className="hidden font-display text-lg font-semibold tracking-tight text-ink sm:block">
            Reel
          </span>
        </Link>
      </div>

      {/* Center: search */}
      <form onSubmit={handleSearch} className="mx-auto hidden w-full max-w-xl flex-1 sm:block">
        <div className="flex items-center overflow-hidden rounded-full border border-base-border bg-base-raised focus-within:border-mint/60">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search videos"
            className="w-full bg-transparent px-4 py-2 text-sm text-ink outline-none placeholder:text-ink-faint"
          />
          <button
            type="submit"
            className="flex h-9 w-12 shrink-0 items-center justify-center border-l border-base-border text-ink-dim transition-colors hover:bg-base-hover hover:text-ink"
            aria-label="Search"
          >
            <SearchIcon className="h-4.5 w-4.5" />
          </button>
        </div>
      </form>

      {/* Right: actions */}
      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Link
          to="/search"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-dim transition-colors hover:bg-base-hover hover:text-ink sm:hidden"
          aria-label="Search"
        >
          <SearchIcon className="h-5 w-5" />
        </Link>

        {loading ? (
          // Match the signed-in avatar slot's footprint so nothing shifts
          // once auth resolves — this avoids a flash of the signed-out
          // Sign in / Get started buttons on a hard refresh while the
          // current-user request is still in flight.
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden h-9 w-20 shrink-0 animate-pulse rounded-full bg-base-hover sm:block" />
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-base-hover" />
          </div>
        ) : user ? (
          <>
            <Link
              to="/upload"
              className="hidden items-center gap-2 rounded-full border border-base-border px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-base-hover sm:flex"
            >
              <UploadIcon className="h-4.5 w-4.5" />
              Create
            </Link>

            <Link
              to="/upload"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-dim transition-colors hover:bg-base-hover hover:text-ink sm:hidden"
              aria-label="Upload"
            >
              <UploadIcon className="h-5 w-5" />
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-1.5 transition-colors hover:bg-base-hover"
                aria-expanded={menuOpen}
              >
                <img
                  src={user.avatar}
                  alt={user.fullname}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <ChevronDownIcon
                  className={`hidden h-3.5 w-3.5 text-ink-faint transition-transform sm:block ${
                    menuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-base-border bg-base-raised py-1.5 shadow-2xl shadow-black/40">
                  <div className="border-b border-base-border px-4 py-3">
                    <p className="truncate text-sm font-semibold text-ink">{user.fullname}</p>
                    <p className="mt-0.5 truncate text-xs text-ink-dim">@{user.username}</p>
                  </div>

                  <div className="p-1">
                    <Link
                      to={`/c/${user.username}`}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-base-hover"
                    >
                      Your channel
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-base-hover"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/pulse"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-base-hover"
                    >
                      Pulse
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-base-hover"
                    >
                      Settings
                    </Link>
                  </div>

                  <div className="border-t border-base-border p-1">
                    <button
                      onClick={handleLogout}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-coral transition-colors hover:bg-coral-soft"
                    >
                      Sign out
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
              className="rounded-full px-3.5 py-2 text-sm font-semibold text-ink-dim transition-colors hover:bg-base-hover hover:text-ink"
            >
              Sign in
            </Link>
            <Link to="/register" className="btn-primary">
              Get started
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
