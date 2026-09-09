import { useEffect, useState } from 'react'
import { getChannelStats, getChannelVideos } from '../api/dashboard'
import VideoCard from '../components/VideoCard'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsRes, videosRes] = await Promise.all([
          getChannelStats(),
          getChannelVideos()
        ])
        setStats(statsRes.data.data)
        setVideos(videosRes.data.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return <div className="text-center py-10">Loading dashboard...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Channel Dashboard</h2>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-softCard p-4 rounded-lg shadow-sm text-center">
            <p className="text-2xl font-bold">{stats.totalVideos}</p>
            <p className="text-sm text-gray-500">Videos</p>
          </div>
          <div className="bg-softCard p-4 rounded-lg shadow-sm text-center">
            <p className="text-2xl font-bold">{stats.totalViews}</p>
            <p className="text-sm text-gray-500">Views</p>
          </div>
          <div className="bg-softCard p-4 rounded-lg shadow-sm text-center">
            <p className="text-2xl font-bold">{stats.totalSubscribers}</p>
            <p className="text-sm text-gray-500">Subscribers</p>
          </div>
          <div className="bg-softCard p-4 rounded-lg shadow-sm text-center">
            <p className="text-2xl font-bold">{stats.totalLikes}</p>
            <p className="text-sm text-gray-500">Likes</p>
          </div>
        </div>
      )}
      <h3 className="text-xl font-semibold mb-3">Your Videos</h3>
      {videos.length === 0 ? (
        <p className="text-gray-400">No videos uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map(v => <VideoCard key={v._id} video={v} />)}
        </div>
      )}
    </div>
  )
}