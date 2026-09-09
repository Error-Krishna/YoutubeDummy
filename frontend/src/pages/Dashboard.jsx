import { useEffect, useState } from 'react'
import { getChannelStats, getChannelVideos } from '../api/dashboard'
import VideoCard from '../components/VideoCard'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsRes, videosRes] = await Promise.all([
          getChannelStats(),
          getChannelVideos()
        ])
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
      <div className="space-y-8">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(item => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(item => (
            <div key={item} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
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

  const statCards = stats
    ? [
        {
          label: 'Videos',
          value: stats.totalVideos,
          icon: '▶',
          accent: 'bg-indigo-50 text-indigo-600'
        },
        {
          label: 'Total Views',
          value: stats.totalViews,
          icon: '◉',
          accent: 'bg-sky-50 text-sky-600'
        },
        {
          label: 'Subscribers',
          value: stats.totalSubscribers,
          icon: '♙',
          accent: 'bg-violet-50 text-violet-600'
        },
        {
          label: 'Likes',
          value: stats.totalLikes,
          icon: '♥',
          accent: 'bg-rose-50 text-rose-600'
        }
      ]
    : []

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
            Creator Studio
          </p>
          <h2 className="page-title">Channel Dashboard</h2>
          <p className="page-subtitle">
            Keep track of your channel performance and uploaded videos.
          </p>
        </div>
      </header>

      {stats && (
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map(card => (
            <div
              key={card.label}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${card.accent}`}
                >
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h3 className="section-title">Your Videos</h3>
            <p className="mt-1 text-sm text-slate-500">
              Manage and review the content published on your channel.
            </p>
          </div>
          {videos.length > 0 && (
            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {videos.length} {videos.length === 1 ? 'video' : 'videos'}
            </span>
          )}
        </div>

        {videos.length === 0 ? (
          <div className="surface flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-xl font-bold text-indigo-600">
              ▶
            </div>
            <h4 className="mt-4 text-lg font-bold text-slate-900">
              No videos uploaded yet
            </h4>
            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
              Your uploaded videos will appear here once you publish your first one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map(v => (
              <VideoCard key={v._id} video={v} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}