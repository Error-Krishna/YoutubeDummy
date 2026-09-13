import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import { getVideoById, deleteVideo, togglePublish, getAllVideos } from '../api/videos'
import { likeVideo, getLikedVideos } from '../api/likes'
import { getUserPlaylists, addVideoToPlaylist } from '../api/playlists'
import { toggleSubscription, checkSubscription } from '../api/subscriptions'
import CommentsSection from '../components/CommentsSection'
import VideoCard from '../components/VideoCard'
import { formatViews, timeAgo } from '../components/VideoCard'
import { useAuth } from '../context/AuthContext'
import { HeartIcon, PlaylistIcon, EditIcon, TrashIcon } from '../components/icons'

export default function VideoDetails() {
  const { videoId } = useParams()
  const [video, setVideo] = useState(null)
  const [videoLoading, setVideoLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false)
  const [playlists, setPlaylists] = useState([])
  const [subscribed, setSubscribed] = useState(false)
  const [subLoading, setSubLoading] = useState(false)
  const [related, setRelated] = useState([])
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Auth still resolving counts as loading too — isOwner depends on
  // `user`, so deciding it before auth resolves can briefly show the
  // Subscribe button on your own video (or hide your Edit/Delete
  // controls) until it snaps to the correct state a moment later.
  const loading = videoLoading || authLoading
  const isOwner = user && video?.owner && user._id === video.owner._id

  const fetchVideo = useCallback(async () => {
    try {
      const res = await getVideoById(videoId)
      setVideo(res.data.data)
    } catch (error) {
      console.error('Failed to load video', error)
    } finally {
      setVideoLoading(false)
    }
  }, [videoId])

  useEffect(() => {
    fetchVideo()
    window.scrollTo({ top: 0 })
  }, [fetchVideo])

  useEffect(() => {
    getAllVideos({ page: 1, limit: 12 })
      .then((res) => {
        const docs = res.data.data.docs || res.data.data
        setRelated(docs.filter((v) => v._id !== videoId))
      })
      .catch((err) => console.log(err))
  }, [videoId])

  useEffect(() => {
    if (!user || !video?.owner?._id || video.owner._id === user._id) return
    checkSubscription(video.owner._id)
      .then((res) => setSubscribed(!!res.data.data.isSubscribed))
      .catch((err) => console.log(err))
  }, [user, video?.owner?._id])

  useEffect(() => {
    if (!user) return
    getLikedVideos()
      .then((res) => {
        const likedIds = res.data.data.map((v) => v._id)
        setLiked(likedIds.includes(videoId))
      })
      .catch((err) => console.log(err))
  }, [user, videoId])

  const handleLike = async () => {
    if (!user) return alert('Please login to like')
    try {
      // The toggle endpoint returns {} when the video was unliked, and the
      // created like document when it was liked — derive state from that
      // instead of blindly flipping, so a slow/duplicate click can't
      // desync the UI from the server.
      const res = await likeVideo(videoId)
      setLiked(Boolean(res.data.data?._id))
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
      // Same pattern as likes: {} means unsubscribed, a subscription
      // document means subscribed. Derive from the response rather than
      // flipping blindly.
      const res = await toggleSubscription(video.owner._id)
      setSubscribed(Boolean(res.data.data?._id))
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
      setShowPlaylistMenu(false)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add to playlist')
      console.log(err)
    }
  }

  const handleTogglePublish = async () => {
    try {
      const res = await togglePublish(videoId)
      setVideo((prev) => ({ ...prev, isPublished: res.data.data.isPublished }))
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
      <div className="page-shell mx-auto max-w-8xl">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-4">
            <div className="shimmer aspect-video rounded-xl" />
            <div className="shimmer h-7 w-3/4 rounded" />
            <div className="shimmer h-4 w-1/3 rounded" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="shimmer h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="surface mx-auto flex min-h-64 max-w-2xl flex-col items-center justify-center text-center">
        <h2 className="text-lg font-semibold text-ink">Video not found</h2>
        <p className="mt-1 text-sm text-ink-dim">
          This video may have been removed or is unavailable.
        </p>
        <Link to="/" className="btn-primary mt-5">
          Back to videos
        </Link>
      </div>
    )
  }

  return (
    <div className="page-shell mx-auto max-w-8xl">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Main column */}
        <div className="min-w-0 space-y-4">
          <div className="overflow-hidden rounded-xl bg-black">
            <div className="aspect-video">
              <video
                src={video.videoFile}
                controls
                className="h-full w-full"
                poster={video.thumbnail}
              />
            </div>
          </div>

          <div>
            <h1 className="font-display text-lg font-semibold leading-tight tracking-tight text-ink sm:text-xl">
              {video.title}
            </h1>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {video.owner && (
                <div className="flex items-center gap-3">
                  <Link to={`/c/${video.owner.username}`}>
                    <img
                      src={video.owner.avatar}
                      alt={video.owner.fullname}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  </Link>
                  <div className="min-w-0">
                    <Link
                      to={`/c/${video.owner.username}`}
                      className="block truncate text-sm font-semibold text-ink hover:text-mint"
                    >
                      {video.owner.fullname}
                    </Link>
                    <p className="text-xs text-ink-faint">@{video.owner.username}</p>
                  </div>

                  {!isOwner && (
                    <button
                      onClick={handleToggleSubscribe}
                      disabled={subLoading}
                      className={`ml-2 shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
                        subscribed
                          ? 'border border-base-border text-ink hover:bg-base-hover'
                          : 'bg-ink text-base hover:bg-ink/90'
                      }`}
                    >
                      {subLoading ? 'Updating...' : subscribed ? 'Subscribed' : 'Subscribe'}
                    </button>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleLike}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    liked ? 'bg-mint-soft text-mint' : 'bg-base-raised text-ink hover:bg-base-hover'
                  }`}
                >
                  <HeartIcon filled={liked} className="h-4.5 w-4.5" />
                  {liked ? 'Liked' : 'Like'}
                </button>

                <div className="relative">
                  <button
                    onClick={openPlaylistMenu}
                    className="inline-flex items-center gap-2 rounded-full bg-base-raised px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-base-hover"
                  >
                    <PlaylistIcon className="h-4.5 w-4.5" />
                    Save
                  </button>

                  {showPlaylistMenu && (
                    <div className="absolute right-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-xl border border-base-border bg-base-raised py-2 shadow-2xl shadow-black/40">
                      <div className="border-b border-base-border px-4 pb-2 pt-1">
                        <p className="text-sm font-semibold text-ink">Save to playlist</p>
                      </div>

                      {playlists.length === 0 ? (
                        <p className="px-4 py-4 text-sm text-ink-faint">No playlists yet.</p>
                      ) : (
                        <div className="max-h-60 overflow-y-auto p-1.5">
                          {playlists.map((pl) => (
                            <button
                              key={pl._id}
                              onClick={() => handleAddToPlaylist(pl._id)}
                              className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-ink transition-colors hover:bg-base-hover"
                            >
                              {pl.name}
                            </button>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => setShowPlaylistMenu(false)}
                        className="w-full border-t border-base-border px-4 py-2.5 text-left text-xs font-semibold text-ink-faint hover:bg-base-hover"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>

                {isOwner && (
                  <>
                    <Link
                      to={`/video/${videoId}/edit`}
                      className="inline-flex items-center gap-2 rounded-full bg-base-raised px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-base-hover"
                    >
                      <EditIcon className="h-4.5 w-4.5" />
                      Edit
                    </Link>
                    <button
                      onClick={handleTogglePublish}
                      className="rounded-full bg-base-raised px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-base-hover"
                    >
                      {video.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={handleDelete}
                      className="inline-flex items-center gap-2 rounded-full bg-coral-soft px-4 py-2 text-sm font-semibold text-coral transition-colors hover:bg-coral/15"
                    >
                      <TrashIcon className="h-4.5 w-4.5" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="surface mt-4 p-4">
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
                <span>{formatViews(video.views)} views</span>
                <span className="text-ink-faint">·</span>
                <span>{timeAgo(video.createdAt)}</span>
                {video.isPublished !== undefined && (
                  <>
                    <span className="text-ink-faint">·</span>
                    <span className={video.isPublished ? 'text-mint' : 'text-coral'}>
                      {video.isPublished ? 'Published' : 'Unpublished'}
                    </span>
                  </>
                )}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink-dim">
                {video.description}
              </p>
            </div>
          </div>

          <CommentsSection videoId={videoId} />
        </div>

        {/* Related rail */}
        <aside className="space-y-3">
          <h2 className="section-title px-1">Up next</h2>
          {related.map((v) => (
            <VideoCard key={v._id} video={v} layout="row" />
          ))}
        </aside>
      </div>
    </div>
  )
}
