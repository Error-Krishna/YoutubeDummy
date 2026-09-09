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

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-4 w-72 animate-pulse rounded bg-slate-200" />
        </div>

        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map(item => (
            <div
              key={item}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="aspect-video animate-pulse bg-slate-200" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-2/5 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="surface flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-xl font-bold text-rose-500">
          !
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">
          Something went wrong
        </h2>
        <p className="mt-1 text-sm text-slate-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
          Your Library
        </p>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="page-title">Watch History</h1>
            <p className="page-subtitle">
              Pick up where you left off and revisit videos you've watched.
            </p>
          </div>

          {videos.length > 0 && (
            <span className="w-fit rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-600">
              {videos.length} {videos.length === 1 ? 'video' : 'videos'}
            </span>
          )}
        </div>
      </header>

      {videos.length === 0 ? (
        <div className="surface flex min-h-72 flex-col items-center justify-center px-6 py-14 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-2xl text-sky-600">
            ◷
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Your watch history is empty
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Videos you watch will appear here, making it easy to come back to something you enjoyed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}
