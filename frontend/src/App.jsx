import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import VideoDetails from './pages/VideoDetails'
import EditVideo from './pages/EditVideo'
import Upload from './pages/Upload'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import ChannelProfile from './pages/ChannelProfile'
import Dashboard from './pages/Dashboard'
import LikedVideos from './pages/LikedVideos'
import WatchHistory from './pages/WatchHistory'
import Subscriptions from './pages/Subscriptions'
import Playlists from './pages/Playlists'
import PlaylistDetails from './pages/PlaylistDetails'
import Tweets from './pages/Tweets'
import Settings from './pages/Settings'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <div className="min-h-screen bg-softBg">
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/video/:videoId" element={<VideoDetails />} />
          <Route path="/video/:videoId/edit" element={<ProtectedRoute><EditVideo /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/c/:username" element={<ChannelProfile />} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/liked-videos" element={<ProtectedRoute><LikedVideos /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><WatchHistory /></ProtectedRoute>} />
          <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
          <Route path="/playlists" element={<ProtectedRoute><Playlists /></ProtectedRoute>} />
          <Route path="/playlist/:playlistId" element={<ProtectedRoute><PlaylistDetails /></ProtectedRoute>} />
          <Route path="/tweets" element={<ProtectedRoute><Tweets /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}

export default App
