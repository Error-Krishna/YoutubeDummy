import { useEffect, useState } from 'react'
import { getAllVideos } from '../api/videos'
import VideoCard from '../components/VideoCard'

export default function Home() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchVideos = async (pageNumber = 1) => {
    try {
      setLoading(true)

      const res = await getAllVideos({ page: pageNumber, limit: 12 })
      const data = res.data.data

      if (pageNumber === 1) {
        setVideos(data.docs || data)
      } else {
        setVideos((prev) => [...prev, ...(data.docs || data)])
      }

      setHasMore(
        data.hasNextPage ??
        data.hasMore ??
        (data.docs ? data.page < data.totalPages : false)
      )
    } catch (error) {
      console.error('Failed to fetch videos', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos(1)
  }, [])

  const handleLoadMore = async () => {
    const nextPage = page + 1
    setPage(nextPage)
    await fetchVideos(nextPage)
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Discover
          </p>

          <h1 className="page-title">
            Explore videos
          </h1>

          <p className="page-subtitle">
            Discover something worth watching.
          </p>
        </div>
      </section>

      {/* Video grid */}
      {videos.length > 0 && (
        <section className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </section>
      )}

      {/* Loading */}
      {loading && videos.length === 0 && (
        <div className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="animate-pulse">
              <div className="aspect-video rounded-2xl bg-slate-200" />
              <div className="mt-3 h-4 w-4/5 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-2/5 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && videos.length === 0 && (
        <div className="surface flex min-h-64 flex-col items-center justify-center px-6 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
            ▶
          </div>

          <h2 className="text-lg font-bold text-slate-900">
            No videos yet
          </h2>

          <p className="mt-1 max-w-sm text-sm text-slate-500">
            There aren't any videos available right now. Check back soon.
          </p>
        </div>
      )}

      {/* Load more */}
      {hasMore && videos.length > 0 && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="btn-secondary min-w-32"
          >
            {loading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}
