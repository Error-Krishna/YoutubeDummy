import { useEffect, useState } from 'react'
import { getLikedVideos } from '../api/likes'
import VideoCard from '../components/VideoCard'

export default function LikedVideos() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getLikedVideos()
        setVideos(res.data.data)
      } catch (err) {
        console.error('Failed to load liked videos', err)
        setError('Failed to load liked videos')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return <div className="text-center py-10">Loading liked videos...</div>
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Liked Videos</h1>
      {videos.length === 0 ? (
        <p className="text-gray-400">You haven't liked any videos yet.</p>
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
