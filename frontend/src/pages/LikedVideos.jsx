import { useEffect, useState } from 'react'
import { getLikedVideos } from '../api/likes'
import VideoCard from '../components/VideoCard'
import { HeartIcon } from '../components/icons'

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

  if (loading) {
    return (
      <div className="page-shell space-y-8">
        <div className="shimmer h-8 w-48 rounded" />
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shimmer aspect-video rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="surface mx-auto flex min-h-56 max-w-lg flex-col items-center justify-center text-center">
        <h2 className="text-base font-semibold text-ink">Something went wrong</h2>
        <p className="mt-1 text-sm text-ink-dim">{error}</p>
      </div>
    )
  }

  return (
    <div className="page-shell space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Liked videos</h1>
          <p className="page-subtitle">Videos you've enjoyed and saved with a like.</p>
        </div>
        {videos.length > 0 && (
          <span className="pill-accent w-fit">{videos.length} {videos.length === 1 ? 'video' : 'videos'}</span>
        )}
      </header>

      {videos.length === 0 ? (
        <div className="surface flex min-h-64 flex-col items-center justify-center px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-coral-soft text-coral">
            <HeartIcon className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-ink">Your liked videos are waiting</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-ink-dim">
            When you like a video, it will appear here so you can easily find it again.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}
