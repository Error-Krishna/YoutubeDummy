import { useEffect, useState } from 'react'
import { getWatchHistory } from '../api/auth'
import VideoCard from '../components/VideoCard'

export default function WatchHistory() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getWatchHistory()
        setVideos(res.data.data)
      } catch (err) {
        console.error('Failed to load watch history', err)
        setError('Failed to load watch history')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return <div className="text-center py-10">Loading watch history...</div>
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Watch History</h1>
      {videos.length === 0 ? (
        <p className="text-gray-400">You haven't watched any videos yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}
