import { Link } from 'react-router-dom'

export default function VideoCard({ video }) {
  const duration = `${Math.floor(video.duration / 60)}:${String(
    Math.floor(video.duration % 60)
  ).padStart(2, '0')}`

  return (
    <article className="group min-w-0">

      {/* Thumbnail */}
      <Link
        to={`/video/${video._id}`}
        className="block overflow-hidden rounded-2xl bg-slate-200 shadow-sm ring-1 ring-slate-200/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="relative aspect-video overflow-hidden">
          <img
            src={video.thumbnail}
            alt={video.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Duration */}
          <span className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/85 px-2 py-1 text-[11px] font-bold tracking-wide text-white shadow-sm">
            {duration}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="px-0.5 pt-3">

        <Link
          to={`/video/${video._id}`}
          className="block"
        >
          <h3 className="line-clamp-2 text-[15px] font-bold leading-5 text-slate-900 transition-colors duration-200 group-hover:text-indigo-600">
            {video.title}
          </h3>
        </Link>

        {video.owner?.username ? (
          <Link
            to={`/c/${video.owner.username}`}
            className="mt-2 block truncate text-xs font-semibold text-slate-500 transition-colors hover:text-indigo-600"
          >
            {video.owner.fullname}
          </Link>
        ) : (
          <p className="mt-2 truncate text-xs font-semibold text-slate-500">
            {video.owner?.fullname || 'Unknown creator'}
          </p>
        )}

        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
          <span>{video.views} views</span>
          <span>•</span>
          <span>
            {new Date(video.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </article>
  )
}
