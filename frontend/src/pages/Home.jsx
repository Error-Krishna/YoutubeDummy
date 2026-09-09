import { useEffect, useState } from 'react'
import { getAllVideos } from '../api/videos'
import VideoCard from '../components/VideoCard'

export default function Home() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAllVideos({ page, limit: 12 })
        setVideos(prev => (page === 1 ? res.data.data.docs : [...prev, ...res.data.data.docs]))
        setHasMore(res.data.data.hasNextPage)
      } catch (error) {
        console.error('Failed to load videos', error)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [page])

  if (loading && page === 1) return <div className="text-center py-10">Loading videos...</div>

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Videos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={() => setPage(p => p + 1)}
            className="bg-softPrimary text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
          >
            Load More
          </button>
        </div>
      )}
      {videos.length === 0 && !loading && <p className="text-gray-400">No videos available.</p>}
    </div>
  )
}