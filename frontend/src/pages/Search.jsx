import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getAllVideos } from '../api/videos'
import VideoCard from '../components/VideoCard'
import { SearchIcon } from '../components/icons'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState([])
  const [allVideos, setAllVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const res = await getAllVideos({ page: 1, limit: 100 })
        setAllVideos(res.data.data.docs || res.data.data)
      } catch (err) {
        console.error('Failed to load videos for search', err)
      } finally {
        setLoading(false)
        setLoaded(true)
      }
    }
    fetchAll()
  }, [])

  useEffect(() => {
    if (!loaded) return
    const q = initialQuery.trim().toLowerCase()
    if (!q) {
      setResults([])
      return
    }
    setResults(
      allVideos.filter(
        (v) =>
          v.title?.toLowerCase().includes(q) ||
          v.description?.toLowerCase().includes(q) ||
          v.owner?.fullname?.toLowerCase().includes(q) ||
          v.owner?.username?.toLowerCase().includes(q)
      )
    )
  }, [initialQuery, allVideos, loaded])

  const handleSubmit = (e) => {
    e.preventDefault()
    setSearchParams(query.trim() ? { q: query.trim() } : {})
  }

  return (
    <div className="page-shell mx-auto max-w-4xl space-y-6">
      <form onSubmit={handleSubmit} className="sm:hidden">
        <div className="flex items-center overflow-hidden rounded-full border border-base-border bg-base-raised focus-within:border-mint/60">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search videos"
            className="w-full bg-transparent px-4 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint"
          />
          <button
            type="submit"
            className="flex h-10 w-12 shrink-0 items-center justify-center border-l border-base-border text-ink-dim"
          >
            <SearchIcon className="h-4.5 w-4.5" />
          </button>
        </div>
      </form>

      {initialQuery ? (
        <>
          <p className="text-sm text-ink-dim">
            {loading ? 'Searching...' : `${results.length} result${results.length === 1 ? '' : 's'} for "${initialQuery}"`}
          </p>

          {!loading && results.length === 0 && (
            <div className="surface flex min-h-56 flex-col items-center justify-center px-6 text-center">
              <h2 className="text-base font-semibold text-ink">No matches found</h2>
              <p className="mt-1 text-sm text-ink-dim">
                Try a different title, creator, or keyword.
              </p>
            </div>
          )}

          <div className="space-y-5">
            {results.map((video) => (
              <VideoCard key={video._id} video={video} layout="row" />
            ))}
          </div>
        </>
      ) : (
        <div className="flex min-h-56 flex-col items-center justify-center text-center">
          <SearchIcon className="h-8 w-8 text-ink-faint" />
          <h2 className="mt-3 text-base font-semibold text-ink">Search for videos</h2>
          <p className="mt-1 text-sm text-ink-dim">
            Find videos by title, description, or creator.
          </p>
        </div>
      )}
    </div>
  )
}
