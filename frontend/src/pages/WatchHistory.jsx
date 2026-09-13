import { useEffect, useState } from 'react'
import { getWatchHistory } from '../api/auth'
import VideoCard from '../components/VideoCard'
import { ClockIcon } from '../components/icons'

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

  if (loading) {
    return (
      <div className="page-shell space-y-8">
        <div className="shimmer h-8 w-48 rounded" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shimmer h-24 rounded-xl" />
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
    <div className="page-shell mx-auto max-w-4xl space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Watch history</h1>
          <p className="page-subtitle">Pick up where you left off.</p>
        </div>
        {videos.length > 0 && (
          <span className="pill w-fit">{videos.length} {videos.length === 1 ? 'video' : 'videos'}</span>
        )}
      </header>

      {videos.length === 0 ? (
        <div className="surface flex min-h-64 flex-col items-center justify-center px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-base-hover text-ink-dim">
            <ClockIcon className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-ink">Your watch history is empty</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-ink-dim">
            Videos you watch will appear here, making it easy to come back to something you enjoyed.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} layout="row" />
          ))}
        </div>
      )}
    </div>
  )
}
