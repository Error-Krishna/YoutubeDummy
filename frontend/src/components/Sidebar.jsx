import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  HomeIcon,
  PulseIcon,
  UsersIcon,
  ClockIcon,
  HeartIcon,
  PlaylistIcon,
  DashboardIcon,
} from './icons'

const primaryLinks = [
  { to: '/', label: 'Home', icon: HomeIcon, end: true },
  { to: '/pulse', label: 'Pulse', icon: PulseIcon },
]

const libraryLinks = [
  { to: '/subscriptions', label: 'Subscriptions', icon: UsersIcon },
  { to: '/history', label: 'History', icon: ClockIcon },
  { to: '/liked-videos', label: 'Liked videos', icon: HeartIcon },
  { to: '/playlists', label: 'Playlists', icon: PlaylistIcon },
]

function NavItem({ to, label, icon: Icon, end, collapsed }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          collapsed ? 'flex-col gap-1 px-1 py-3 text-center' : ''
        } ${
          isActive
            ? 'bg-mint-soft text-mint'
            : 'text-ink-dim hover:bg-base-hover hover:text-ink'
        }`
      }
    >
      <Icon className={collapsed ? 'h-5 w-5 shrink-0' : 'h-5 w-5 shrink-0'} />
      <span className={collapsed ? 'text-[10px] leading-none' : ''}>{label}</span>
    </NavLink>
  )
}

export default function Sidebar({ collapsed = false, onNavigate }) {
  const { user, loading } = useAuth()

  return (
    <aside
      onClick={onNavigate}
      className={`h-full overflow-y-auto border-r border-base-border bg-base py-3 ${
        collapsed ? 'w-[72px] px-1.5' : 'w-60 px-2.5'
      }`}
    >
      <nav className="space-y-0.5">
        {primaryLinks.map((link) => (
          <NavItem key={link.to} {...link} collapsed={collapsed} />
        ))}
      </nav>

      {loading ? (
        // Skeleton for the "You" section while auth is resolving, sized to
        // match the real nav items so nothing jumps once it loads — avoids
        // flashing the signed-out prompt card on a hard refresh.
        <>
          <div className="my-3 h-px bg-base-border" />
          <div className={`space-y-2 ${collapsed ? 'px-1' : 'px-3'}`}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-5 w-5 shrink-0 animate-pulse rounded bg-base-hover" />
                {!collapsed && <div className="h-3.5 w-24 animate-pulse rounded bg-base-hover" />}
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {user && (
            <>
              <div className="my-3 h-px bg-base-border" />
              {!collapsed && (
                <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  You
                </p>
              )}
              <nav className="space-y-0.5">
                <NavItem to="/dashboard" label="Dashboard" icon={DashboardIcon} collapsed={collapsed} />
                {libraryLinks.map((link) => (
                  <NavItem key={link.to} {...link} collapsed={collapsed} />
                ))}
              </nav>
            </>
          )}

          {!user && !collapsed && (
            <div className="mt-4 rounded-xl border border-base-border bg-base-raised p-4">
              <p className="text-sm text-ink-dim">
                Sign in to like videos, comment, post to Pulse and subscribe to channels.
              </p>
            </div>
          )}
        </>
      )}
    </aside>
  )
}
