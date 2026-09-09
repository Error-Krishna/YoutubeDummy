import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import { getVideoById, deleteVideo, togglePublish } from '../api/videos'
import { likeVideo, getLikedVideos } from '../api/likes'
import { getUserPlaylists, addVideoToPlaylist } from '../api/playlists'
import { toggleSubscription, checkSubscription } from '../api/subscriptions'
import CommentsSection from '../components/CommentsSection'
import { useAuth } from '../context/AuthContext'

export default function VideoDetails() {
  const { videoId } = useParams()
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false)
  const [playlists, setPlaylists] = useState([])
  const [subscribed, setSubscribed] = useState(false)
  const [subLoading, setSubLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const isOwner = user && video?.owner && user._id === video.owner._id

  const fetchVideo = useCallback(async () => {
    try {
      const res = await getVideoById(videoId)
      setVideo(res.data.data)
    } catch (error) {
      console.error('Failed to load video', error)
    } finally {
      setLoading(false)
    }
  }, [videoId])

  useEffect(() => {
    fetchVideo()
  }, [fetchVideo])

  useEffect(() => {
    if (!user || !video?.owner?._id || video.owner._id === user._id) return
    checkSubscription(video.owner._id)
      .then(res => setSubscribed(!!res.data.data.isSubscribed))
      .catch(err => console.log(err))
  }, [user, video?.owner?._id])

  useEffect(() => {
    if (!user) return
    getLikedVideos()
      .then(res => {
        const likedIds = res.data.data.map(v => v._id)
        setLiked(likedIds.includes(videoId))
      })
      .catch(err => console.log(err))
  }, [user, videoId])

  const handleLike = async () => {
    if (!user) return alert('Please login to like')
    try {
      await likeVideo(videoId)
      setLiked(prev => !prev)
    } catch (error) {
      alert('Failed to like')
      console.log(error)
    }
  }

  const handleToggleSubscribe = async () => {
    if (!user) return alert('Please login to subscribe')
    if (!video?.owner?._id) return
    setSubLoading(true)
    try {
      await toggleSubscription(video.owner._id)
      setSubscribed(prev => !prev)
    } catch (err) {
      alert('Failed to update subscription')
      console.log(err)
    } finally {
      setSubLoading(false)
    }
  }

  const openPlaylistMenu = async () => {
    if (!user) return alert('Please login to save to a playlist')
    setShowPlaylistMenu(true)
    try {
      const res = await getUserPlaylists()
      setPlaylists(res.data.data)
    } catch (err) {
      console.log(err)
    }
  }

  const handleAddToPlaylist = async (playlistId) => {
    try {
      await addVideoToPlaylist(playlistId, videoId)
      alert('Added to playlist')
      setShowPlaylistMenu(false)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add to playlist')
      console.log(err)
    }
  }

  const handleTogglePublish = async () => {
    try {
      const res = await togglePublish(videoId)
      setVideo(prev => ({ ...prev, isPublished: res.data.data.isPublished }))
    } catch (err) {
      alert('Failed to update publish status')
      console.log(err)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this video? This cannot be undone.')) return
    try {
      await deleteVideo(videoId)
      navigate('/')
    } catch (err) {
      alert('Failed to delete video')
      console.log(err)
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="aspect-video animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-8 w-3/4 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
      </div>
    )
  }

  if (!video) {
    return (
      <div className="surface flex min-h-64 flex-col items-center justify-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">
          ?
        </div>
        <h2 className="text-lg font-bold text-slate-900">Video not found</h2>
        <p className="mt-1 text-sm text-slate-500">
          This video may have been removed or is unavailable.
        </p>
        <Link to="/" className="btn-primary mt-5">
          Back to videos
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">

      {/* Video player */}
      <div className="overflow-hidden rounded-2xl bg-black shadow-xl ring-1 ring-slate-900/10">
        <div className="aspect-video">
          <video
            src={video.videoFile}
            controls
            className="h-full w-full"
            poster={video.thumbnail}
          />
        </div>
      </div>

      {/* Main information */}
      <section className="space-y-5">

        {/* Title + owner actions */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl">
              {video.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
              <span>{video.views} views</span>
              <span className="text-slate-300">•</span>
              <span>
                {new Date(video.createdAt).toLocaleDateString()}
              </span>

              {video.isPublished !== undefined && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className={video.isPublished ? 'text-emerald-600' : 'text-amber-600'}>
                    {video.isPublished ? 'Published' : 'Unpublished'}
                  </span>
                </>
              )}
            </div>
          </div>

          {isOwner && (
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/video/${videoId}/edit`}
                className="btn-secondary"
              >
                Edit
              </Link>

              <button
                onClick={handleTogglePublish}
                className="btn-secondary"
              >
                {video.isPublished ? 'Unpublish' : 'Publish'}
              </button>

              <button
                onClick={handleDelete}
                className="inline-flex items-center justify-center rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-5">

          <button
            onClick={handleLike}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              liked
                ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>{liked ? '♥' : '♡'}</span>
            {liked ? 'Liked' : 'Like'}
          </button>

          <div className="relative">
            <button
              onClick={openPlaylistMenu}
              className="btn-secondary"
            >
              + Save
            </button>

            {showPlaylistMenu && (
              <div className="absolute left-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl shadow-slate-900/10">

                <div className="border-b border-slate-100 px-4 pb-2 pt-1">
                  <p className="text-sm font-bold text-slate-900">
                    Save to playlist
                  </p>
                </div>

                {playlists.length === 0 ? (
                  <p className="px-4 py-4 text-sm text-slate-400">
                    No playlists yet.
                  </p>
                ) : (
                  <div className="max-h-60 overflow-y-auto p-1.5">
                    {playlists.map((pl) => (
                      <button
                        key={pl._id}
                        onClick={() => handleAddToPlaylist(pl._id)}
                        className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        {pl.name}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setShowPlaylistMenu(false)}
                  className="w-full border-t border-slate-100 px-4 py-2.5 text-left text-xs font-semibold text-slate-400 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description + creator */}
        <div className="surface overflow-hidden">

          <div className="p-5 sm:p-6">
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {video.description}
            </p>
          </div>

          {video.owner && (
            <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/60 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

              <Link
                to={`/c/${video.owner.username}`}
                className="flex min-w-0 items-center gap-3"
              >
                <img
                  src={video.owner.avatar}
                  alt={video.owner.fullname}
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm"
                />

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {video.owner.fullname}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    @{video.owner.username}
                  </p>
                </div>
              </Link>

              {!isOwner && (
                <button
                  onClick={handleToggleSubscribe}
                  disabled={subLoading}
                  className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                    subscribed
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:shadow-md'
                  }`}
                >
                  {subLoading
                    ? 'Updating...'
                    : subscribed
                      ? 'Subscribed'
                      : 'Subscribe'}
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Comments */}
      <section className="pt-2">
        <CommentsSection videoId={videoId} />
      </section>
    </div>
  )


}
