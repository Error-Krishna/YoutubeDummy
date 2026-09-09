import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
const Home = lazy(() => import('./pages/Home'))
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
const Tweets = lazy(() => import('./pages/Tweets'))
const Settings = lazy(() => import('./pages/Settings'))
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="page-container py-6 sm:py-8 lg:py-10">
        <Suspense
          fallback={
            <div className="page-loading">
              <div className="page-loading-card">
                <div className="flex items-center gap-4">
                  <div className="shimmer h-12 w-12 shrink-0 rounded-2xl" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="shimmer h-4 w-2/3 rounded-lg" />
                    <div className="shimmer h-3 w-1/2 rounded-lg" />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="shimmer h-3 w-full rounded-lg" />
                  <div className="shimmer h-3 w-5/6 rounded-lg" />
                  <div className="shimmer h-3 w-2/3 rounded-lg" />
                </div>
              </div>
            </div>
          }
        >
        <Routes>
          <Route path="/" element={<Home />} />
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
          <Route
            path="/tweets"
            element={
              <ProtectedRoute>
                <Tweets />
              </ProtectedRoute>
            }
          />
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
  )
}

export default App
