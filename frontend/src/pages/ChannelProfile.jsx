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

      const videosRes = await getAllVideos({
        userId: res.data.data._id,
        limit: 24
      })

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
      setChannel(prev => ({
        ...prev,
        avatar: res.data.data.avatar
      }))
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
      setChannel(prev => ({
        ...prev,
        coverImage: res.data.data.coverImage
      }))
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-56 animate-pulse rounded-2xl bg-slate-200 sm:h-64" />

        <div className="-mt-16 flex items-center gap-4 px-4">
          <div className="h-24 w-24 shrink-0 animate-pulse rounded-full bg-slate-300 ring-4 ring-white" />

          <div className="space-y-2">
            <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !channel) {
    return (
      <div className="surface flex min-h-64 flex-col items-center justify-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">
          ?
        </div>

        <h2 className="text-lg font-bold text-slate-900">
          Channel not found
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          This channel may no longer be available.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* Cover */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-200 shadow-sm ring-1 ring-slate-200">
        <div className="aspect-[4/1] min-h-44 sm:min-h-56">
          <img
            src={
              channel.coverImage ||
              'https://placehold.co/1200x300?text=Your+Channel'
            }
            alt="Channel cover"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>

        {isOwnChannel && (
          <label className="absolute right-3 top-3 cursor-pointer rounded-xl bg-black/60 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-black/75 sm:right-4 sm:top-4">
            Change cover
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
          </label>
        )}
      </section>

      {/* Channel identity */}
      <section className="-mt-16 relative px-4 sm:-mt-20 sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">

            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={channel.avatar}
                alt={channel.fullname}
                className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg sm:h-28 sm:w-28"
              />

              {isOwnChannel && (
                <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-sm shadow-md ring-1 ring-slate-200 transition-colors hover:bg-slate-50">
                  +
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 pb-1">
              <h1 className="truncate text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                {channel.fullname}
              </h1>

              <p className="mt-1 text-sm font-medium text-slate-500">
                @{channel.username}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className="font-semibold text-slate-700">
                  {channel.subscribersCount}
                </span>
                <span>subscribers</span>

                <span className="text-slate-300">•</span>

                <span className="font-semibold text-slate-700">
                  {channel.channelsSubscribedToCount}
                </span>
                <span>subscriptions</span>
              </div>
            </div>
          </div>

          {/* Channel action */}
          <div className="pb-1 lg:pb-2">
            {isOwnChannel ? (
              <label className="btn-secondary cursor-pointer">
                Change avatar
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <button
                onClick={handleToggleSubscribe}
                disabled={subLoading}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                  channel.isSubscribed
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:shadow-md'
                }`}
              >
                {subLoading
                  ? 'Updating...'
                  : channel.isSubscribed
                    ? 'Subscribed'
                    : 'Subscribe'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Videos */}
      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
              Channel
            </p>

            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Videos
            </h2>
          </div>

          <span className="text-sm text-slate-400">
            {videos.length} videos
          </span>
        </div>

        {videos.length === 0 ? (
          <div className="surface flex min-h-56 flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-lg">
              ▶
            </div>

            <h3 className="text-sm font-bold text-slate-900">
              No videos published yet
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Videos published on this channel will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <VideoCard
                key={video._id}
                video={video}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
