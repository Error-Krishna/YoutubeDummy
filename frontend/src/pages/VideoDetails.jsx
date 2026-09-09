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

  if (loading) return <div className="text-center py-10">Loading video...</div>
  if (!video) return <div className="text-center py-10">Video not found.</div>

  return (
    <div>
      <div className="bg-black rounded-xl overflow-hidden aspect-video">
        <video
          src={video.videoFile}
          controls
          className="w-full h-full"
          poster={video.thumbnail}
        />
      </div>
      <div className="mt-4">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <h1 className="text-2xl font-semibold">{video.title}</h1>
          {isOwner && (
            <div className="flex gap-2">
              <Link
                to={`/video/${videoId}/edit`}
                className="text-sm bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200"
              >
                Edit
              </Link>
              <button
                onClick={handleTogglePublish}
                className="text-sm bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200"
              >
                {video.isPublished ? 'Unpublish' : 'Publish'}
              </button>
              <button
                onClick={handleDelete}
                className="text-sm bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mt-2 flex-wrap">
          <span className="text-sm text-gray-500">{video.views} views</span>
          <span className="text-sm text-gray-500">{new Date(video.createdAt).toLocaleDateString()}</span>
          <button
            onClick={handleLike}
            className={`text-sm px-3 py-1 rounded-full hover:bg-opacity-90 ${
              liked ? 'bg-softPrimary text-white' : 'bg-softSecondary text-white'
            }`}
          >
            {liked ? 'Liked' : 'Like'}
          </button>
          <div className="relative">
            <button
              onClick={openPlaylistMenu}
              className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200"
            >
              Save to Playlist
            </button>
            {showPlaylistMenu && (
              <div className="absolute z-10 mt-2 bg-white border rounded-lg shadow-lg w-56 py-1">
                {playlists.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-gray-400">No playlists yet.</p>
                ) : (
                  playlists.map((pl) => (
                    <button
                      key={pl._id}
                      onClick={() => handleAddToPlaylist(pl._id)}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      {pl.name}
                    </button>
                  ))
                )}
                <button
                  onClick={() => setShowPlaylistMenu(false)}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-50 border-t"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 p-4 bg-softCard rounded-lg shadow-sm">
          <p className="text-gray-700 whitespace-pre-wrap">{video.description}</p>
          {video.owner && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <Link to={`/c/${video.owner.username}`} className="flex items-center gap-2">
                <img
                  src={video.owner.avatar}
                  alt={video.owner.fullname}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-gray-700">{video.owner.fullname}</span>
              </Link>
              {!isOwner && (
                <button
                  onClick={handleToggleSubscribe}
                  disabled={subLoading}
                  className={`text-xs px-3 py-1 rounded-full disabled:opacity-50 ${
                    subscribed
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-softPrimary text-white hover:bg-opacity-90'
                  }`}
                >
                  {subscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <CommentsSection videoId={videoId} />
    </div>
  )
}
