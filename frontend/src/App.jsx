import { lazy, Suspense, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Topbar from './components/Topbar'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'

const Home = lazy(() => import('./pages/Home'))
const Search = lazy(() => import('./pages/Search'))
const VideoDetails = lazy(() => import('./pages/VideoDetails'))
const EditVideo = lazy(() => import('./pages/EditVideo'))
const Upload = lazy(() => import('./pages/Upload'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Profile = lazy(() => import('./pages/Profile'))
const ChannelProfile = lazy(() => import('./pages/ChannelProfile'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const LikedVideos = lazy(() => import('./pages/LikedVideos'))
const WatchHistory = lazy(() => import('./pages/WatchHistory'))
const Subscriptions = lazy(() => import('./pages/Subscriptions'))
const Playlists = lazy(() => import('./pages/Playlists'))
const PlaylistDetails = lazy(() => import('./pages/PlaylistDetails'))
const Pulse = lazy(() => import('./pages/Pulse'))
const Settings = lazy(() => import('./pages/Settings'))

function PageLoading() {
  return (
    <div className="page-loading">
      <div className="page-loading-card">
        <div className="flex items-center gap-4">
          <div className="shimmer h-12 w-12 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="shimmer h-4 w-2/3 rounded" />
            <div className="shimmer h-3 w-1/2 rounded" />
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <div className="shimmer h-3 w-full rounded" />
          <div className="shimmer h-3 w-5/6 rounded" />
          <div className="shimmer h-3 w-2/3 rounded" />
        </div>
      </div>
    </div>
  )
}

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-base text-ink">
      <Topbar onToggleSidebar={() => {
        setSidebarCollapsed((c) => !c)
        setMobileNavOpen((o) => !o)
      }} />

      <div className="flex">
        {/* Desktop sidebar */}
        <div className="sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 md:block">
          <Sidebar collapsed={sidebarCollapsed} />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-30 md:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="absolute left-0 top-14 h-[calc(100vh-3.5rem)]">
              <Sidebar onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 px-3 py-5 sm:px-5 sm:py-6 lg:px-8">
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/video/:videoId" element={<VideoDetails />} />
              <Route
                path="/video/:videoId/edit"
                element={
                  <ProtectedRoute>
                    <EditVideo />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="/c/:username" element={<ChannelProfile />} />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <Upload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/liked-videos"
                element={
                  <ProtectedRoute>
                    <LikedVideos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <WatchHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subscriptions"
                element={
                  <ProtectedRoute>
                    <Subscriptions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/playlists"
                element={
                  <ProtectedRoute>
                    <Playlists />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/playlist/:playlistId"
                element={
                  <ProtectedRoute>
                    <PlaylistDetails />
                  </ProtectedRoute>
                }
              />
              <Route path="/pulse" element={<Pulse />} />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export default App
