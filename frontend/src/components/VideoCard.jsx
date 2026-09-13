import { Link } from 'react-router-dom'

function formatDuration(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }
  return `${m}:${String(sec).padStart(2, '0')}`
}

function formatViews(views = 0) {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return `${views}`
}

function timeAgo(dateString) {
  const date = new Date(dateString)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [label, secs] of units) {
    const value = Math.floor(seconds / secs)
    if (value >= 1) return `${value} ${label}${value > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

export default function VideoCard({ video, layout = 'grid' }) {
  if (layout === 'row') {
    return (
      <article className="group flex gap-3">
        <Link
          to={`/video/${video._id}`}
          className="relative w-40 shrink-0 overflow-hidden rounded-lg bg-base-hover sm:w-48"
        >
          <div className="aspect-video overflow-hidden">
            <img
              src={video.thumbnail}
              alt={video.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          </div>
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/85 px-1.5 py-0.5 text-[11px] font-semibold text-ink">
            {formatDuration(video.duration)}
          </span>
        </Link>

        <div className="min-w-0 flex-1 pt-0.5">
          <Link to={`/video/${video._id}`}>
            <h3 className="clamp-2 text-sm font-semibold leading-5 text-ink transition-colors group-hover:text-mint">
              {video.title}
            </h3>
          </Link>
          <p className="mt-1.5 truncate text-xs text-ink-dim">
            {video.owner?.fullname || 'Unknown creator'}
          </p>
          <p className="mt-0.5 text-xs text-ink-faint">
            {formatViews(video.views)} views · {timeAgo(video.createdAt)}
          </p>
        </div>
      </article>
    )
  }

  return (
    <article className="group min-w-0">
      <Link
        to={`/video/${video._id}`}
        className="block overflow-hidden rounded-xl bg-base-hover"
      >
        <div className="relative aspect-video overflow-hidden">
          <img
            src={video.thumbnail}
            alt={video.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <span className="absolute bottom-2 right-2 rounded bg-black/85 px-1.5 py-0.5 text-[11px] font-semibold text-ink">
            {formatDuration(video.duration)}
          </span>
        </div>
      </Link>

      <div className="mt-3 flex gap-2.5">
        {video.owner?.avatar && (
          <Link to={`/c/${video.owner.username}`} className="shrink-0">
            <img
              src={video.owner.avatar}
              alt={video.owner.fullname}
              className="h-9 w-9 rounded-full object-cover"
            />
          </Link>
        )}

        <div className="min-w-0 flex-1">
          <Link to={`/video/${video._id}`}>
            <h3 className="clamp-2 text-[15px] font-semibold leading-5 text-ink transition-colors group-hover:text-mint">
              {video.title}
            </h3>
          </Link>

          {video.owner?.username ? (
            <Link
              to={`/c/${video.owner.username}`}
              className="mt-1.5 block truncate text-xs text-ink-dim transition-colors hover:text-ink"
            >
              {video.owner.fullname}
            </Link>
          ) : (
            <p className="mt-1.5 truncate text-xs text-ink-dim">
              {video.owner?.fullname || 'Unknown creator'}
            </p>
          )}

          <p className="mt-0.5 text-xs text-ink-faint">
            {formatViews(video.views)} views · {timeAgo(video.createdAt)}
          </p>
        </div>
      </div>
    </article>
  )
}

export { formatDuration, formatViews, timeAgo }
