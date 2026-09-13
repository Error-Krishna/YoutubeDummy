import { useEffect, useState } from 'react'
import { getAllVideos } from '../api/videos'
import VideoCard from '../components/VideoCard'

const CATEGORIES = ['All', 'Recently added', 'Most viewed', 'Longest', 'Shortest']

export default function Home() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [category, setCategory] = useState('All')

  const sortFor = (cat) => {
    switch (cat) {
      case 'Most viewed':
        return { sortBy: 'views', sortType: 'desc' }
      case 'Longest':
        return { sortBy: 'duration', sortType: 'desc' }
      case 'Shortest':
        return { sortBy: 'duration', sortType: 'asc' }
      default:
        return { sortBy: 'createdAt', sortType: 'desc' }
    }
  }

  const fetchVideos = async (pageNumber, cat) => {
    try {
      setLoading(true)
      const res = await getAllVideos({ page: pageNumber, limit: 16, ...sortFor(cat) })
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
    setPage(1)
    fetchVideos(1, category)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  const handleLoadMore = async () => {
    const nextPage = page + 1
    setPage(nextPage)
    await fetchVideos(nextPage, category)
  }

  return (
    <div className="page-shell space-y-5">
      {/* Category chips */}
      <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`shrink-0 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
              category === cat
                ? 'bg-ink text-base'
                : 'bg-base-raised text-ink-dim hover:bg-base-hover hover:text-ink'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Video grid */}
      {videos.length > 0 && (
        <section className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </section>
      )}

      {loading && videos.length === 0 && (
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i}>
              <div className="shimmer aspect-video rounded-xl" />
              <div className="mt-3 flex gap-2.5">
                <div className="shimmer h-9 w-9 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="shimmer h-4 w-4/5 rounded" />
                  <div className="shimmer h-3 w-2/5 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && videos.length === 0 && (
        <div className="surface flex min-h-64 flex-col items-center justify-center px-6 text-center">
          <h2 className="text-lg font-semibold text-ink">No videos yet</h2>
          <p className="mt-1 max-w-sm text-sm text-ink-dim">
            There aren't any videos available right now. Check back soon.
          </p>
        </div>
      )}

      {hasMore && videos.length > 0 && (
        <div className="flex justify-center pt-4">
          <button onClick={handleLoadMore} disabled={loading} className="btn-secondary min-w-32">
            {loading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}
