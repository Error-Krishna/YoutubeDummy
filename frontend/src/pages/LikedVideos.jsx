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
            <h1 className="page-title">Liked Videos</h1>
            <p className="page-subtitle">
              Videos you've enjoyed and saved with a like.
            </p>
          </div>

          {videos.length > 0 && (
            <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
              {videos.length} {videos.length === 1 ? 'video' : 'videos'}
            </span>
          )}
        </div>
      </header>

      {videos.length === 0 ? (
        <div className="surface flex min-h-72 flex-col items-center justify-center px-6 py-14 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-2xl text-rose-500">
            ♥
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Your liked videos are waiting
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            When you like a video, it will appear here so you can easily find it again.
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
