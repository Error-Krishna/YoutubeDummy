import { useEffect, useState } from 'react'
import { getChannelStats, getChannelVideos } from '../api/dashboard'
import VideoCard from '../components/VideoCard'
import { PlayIcon, CompassIcon, UsersIcon, HeartIcon } from '../components/icons'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsRes, videosRes] = await Promise.all([getChannelStats(), getChannelVideos()])
        setStats(statsRes.data.data)
        setVideos(videosRes.data.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) {
    return (
      <div className="page-shell space-y-8">
        <div className="shimmer h-8 w-56 rounded" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shimmer h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shimmer aspect-video rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const statCards = stats
    ? [
        { label: 'Videos', value: stats.totalVideos, icon: PlayIcon },
        { label: 'Total views', value: stats.totalViews, icon: CompassIcon },
        { label: 'Subscribers', value: stats.totalSubscribers, icon: UsersIcon },
        { label: 'Likes', value: stats.totalLikes, icon: HeartIcon },
      ]
    : []

  return (
    <div className="page-shell space-y-8">
      <header>
        <h1 className="page-title">Channel dashboard</h1>
        <p className="page-subtitle">Keep track of your channel performance and uploaded videos.</p>
      </header>

      {stats && (
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label} className="surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-ink-dim">{card.label}</p>
                  <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                    {card.value}
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-mint-soft text-mint">
                  <card.icon className="h-4.5 w-4.5" />
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      <section>
        <div className="mb-5 flex items-end justify-between gap-4 border-b border-base-border pb-3">
          <h2 className="section-title">Your videos</h2>
          {videos.length > 0 && (
            <span className="pill">{videos.length} {videos.length === 1 ? 'video' : 'videos'}</span>
          )}
        </div>

        {videos.length === 0 ? (
          <div className="surface flex min-h-56 flex-col items-center justify-center px-6 py-12 text-center">
            <h3 className="text-base font-semibold text-ink">No videos uploaded yet</h3>
            <p className="mt-1 max-w-sm text-sm text-ink-dim">
              Your uploaded videos will appear here once you publish your first one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((v) => (
              <VideoCard key={v._id} video={v} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
