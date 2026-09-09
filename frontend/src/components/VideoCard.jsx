import { Link } from 'react-router-dom'

export default function VideoCard({ video }) {
  return (
    <div className="bg-softCard rounded-xl overflow-hidden shadow-sm hover:shadow-md transition duration-200">
      <Link to={`/video/${video._id}`} className="block group">
        <div className="aspect-video bg-gray-200 relative">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')}
          </span>
        </div>
      </Link>
      <div className="p-3">
        <Link to={`/video/${video._id}`}>
          <h3 className="font-medium text-gray-800 line-clamp-1">{video.title}</h3>
        </Link>
        {video.owner?.username ? (
          <Link to={`/c/${video.owner.username}`} className="text-sm text-gray-500 mt-1 hover:underline block">
            {video.owner.fullname}
          </Link>
        ) : (
          <p className="text-sm text-gray-500 mt-1">{video.owner?.fullname || 'Unknown'}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
          <span>{video.views} views</span>
          <span>•</span>
          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}
