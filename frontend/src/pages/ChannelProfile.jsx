import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getChannelProfile, updateAvatar, updateCover } from '../api/auth'
import { toggleSubscription } from '../api/subscriptions'
import { getAllVideos } from '../api/videos'
import VideoCard from '../components/VideoCard'

export default function ChannelProfile() {
  const { username } = useParams()
  const { user } = useAuth()
  const [channel, setChannel] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [subLoading, setSubLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const isOwnChannel = user && channel && user._id === channel._id

  const fetchChannel = useCallback(async () => {
    setLoading(true)
    setNotFound(false)
    try {
      const res = await getChannelProfile(username)
      setChannel(res.data.data)

      const videosRes = await getAllVideos({ userId: res.data.data._id, limit: 24 })
      setVideos(videosRes.data.data.docs)
    } catch (error) {
      console.error(error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [username])

  useEffect(() => {
    fetchChannel()
  }, [fetchChannel])

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('avatar', file)
    try {
      const res = await updateAvatar(fd)
      setChannel(prev => ({ ...prev, avatar: res.data.data.avatar }))
    } catch (err) {
      alert('Failed to update avatar')
      console.log(err)
    }
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('coverImage', file)
    try {
      const res = await updateCover(fd)
      setChannel(prev => ({ ...prev, coverImage: res.data.data.coverImage }))
    } catch (error) {
      alert('Failed to update cover')
      console.log(error)
    }
  }

  const handleToggleSubscribe = async () => {
    if (!user) return alert('Please login to subscribe')
    setSubLoading(true)
    try {
      await toggleSubscription(channel._id)
      setChannel(prev => ({
        ...prev,
        isSubscribed: !prev.isSubscribed,
        subscribersCount: prev.isSubscribed
          ? prev.subscribersCount - 1
          : prev.subscribersCount + 1
      }))
    } catch (err) {
      alert('Failed to update subscription')
      console.log(err)
    } finally {
      setSubLoading(false)
    }
  }

  if (loading) return <div className="text-center py-10">Loading channel...</div>
  if (notFound || !channel) return <div className="text-center py-10">Channel not found</div>

  return (
    <div>
      <div className="relative">
        <img
          src={channel.coverImage || 'https://placehold.co/1200x300?text=Cover'}
          alt="Cover"
          className="w-full h-48 object-cover rounded-lg bg-gray-200"
        />
        {isOwnChannel && (
          <div className="absolute top-2 right-2">
            <label className="bg-white/70 p-1 rounded cursor-pointer text-sm">
              Change Cover
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            </label>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4 -mt-10 ml-4 relative">
        <img
          src={channel.avatar}
          alt={channel.fullname}
          className="w-20 h-20 rounded-full border-4 border-white object-cover"
        />
        <div>
          <h2 className="text-2xl font-bold">{channel.fullname}</h2>
          <p className="text-gray-500">@{channel.username}</p>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>{channel.subscribersCount} subscribers</span>
            <span>{channel.channelsSubscribedToCount} subscribed</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {isOwnChannel ? (
            <label className="bg-softPrimary text-white px-3 py-1 rounded cursor-pointer text-sm">
              Change Avatar
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          ) : (
            <button
              onClick={handleToggleSubscribe}
              disabled={subLoading}
              className={`px-4 py-2 rounded-full text-sm font-medium disabled:opacity-50 ${
                channel.isSubscribed
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-softPrimary text-white hover:bg-opacity-90'
              }`}
            >
              {channel.isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-3">Videos</h3>
        {videos.length === 0 ? (
          <p className="text-gray-400">No videos published yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
