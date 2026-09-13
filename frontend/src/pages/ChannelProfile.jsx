import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getChannelProfile, updateAvatar, updateCover } from '../api/auth'
import { toggleSubscription } from '../api/subscriptions'
import { getAllVideos } from '../api/videos'
import VideoCard from '../components/VideoCard'
import { PlusIcon } from '../components/icons'

export default function ChannelProfile() {
  const { username } = useParams()
  const { user, loading: authLoading } = useAuth()
  const [channel, setChannel] = useState(null)
  const [videos, setVideos] = useState([])
  const [channelLoading, setChannelLoading] = useState(true)
  const [subLoading, setSubLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  // Auth still resolving counts as loading too — isOwnChannel depends on
  // `user`, so deciding it before auth resolves can briefly show
  // "Subscribe" on your own channel, or hide your own edit controls,
  // until it pops to the correct state a moment later.
  const loading = authLoading || channelLoading
  const isOwnChannel = user && channel && user._id === channel._id

  const fetchChannel = useCallback(async () => {
    setChannelLoading(true)
    setNotFound(false)
    try {
      const res = await getChannelProfile(username)
      setChannel(res.data.data)

      const videosRes = await getAllVideos({ userId: res.data.data._id, limit: 24 })
      setVideos(videosRes.data.data.docs || videosRes.data.data || [])
    } catch (error) {
      console.error(error)
      setNotFound(true)
    } finally {
      setChannelLoading(false)
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
      setChannel((prev) => ({ ...prev, avatar: res.data.data.avatar }))
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
      setChannel((prev) => ({ ...prev, coverImage: res.data.data.coverImage }))
    } catch (error) {
      alert('Failed to update cover')
      console.log(error)
    }
  }

  const handleToggleSubscribe = async () => {
    if (!user) return alert('Please login to subscribe')
    setSubLoading(true)
    try {
      // {} means unsubscribed, a subscription document means subscribed —
      // derive from the response instead of flipping local state blindly.
      const res = await toggleSubscription(channel._id)
      const nowSubscribed = Boolean(res.data.data?._id)
      setChannel((prev) => ({
        ...prev,
        isSubscribed: nowSubscribed,
        subscribersCount: nowSubscribed
          ? prev.subscribersCount + 1
          : Math.max(0, prev.subscribersCount - 1),
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
      <div className="page-shell space-y-6">
        <div className="shimmer h-40 rounded-xl sm:h-52" />
        <div className="-mt-12 flex items-end gap-4 px-2">
          <div className="shimmer h-24 w-24 shrink-0 rounded-full ring-4 ring-base" />
          <div className="space-y-2 pb-1">
            <div className="shimmer h-6 w-40 rounded" />
            <div className="shimmer h-4 w-24 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !channel) {
    return (
      <div className="surface mx-auto flex min-h-64 max-w-lg flex-col items-center justify-center text-center">
        <h2 className="text-lg font-semibold text-ink">Channel not found</h2>
        <p className="mt-1 text-sm text-ink-dim">This channel may no longer be available.</p>
      </div>
    )
  }

  return (
    <div className="page-shell space-y-8">
      {/* Cover */}
      <section className="relative overflow-hidden rounded-xl bg-base-hover">
        <div className="aspect-[5/1] min-h-32 sm:min-h-44">
          {channel.coverImage ? (
            <img src={channel.coverImage} alt="Channel cover" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-base-hover via-base-raised to-base-hover" />
          )}
        </div>

        {isOwnChannel && (
          <label className="absolute right-3 top-3 cursor-pointer rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-ink backdrop-blur transition-colors hover:bg-black/85">
            Change cover
            <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
          </label>
        )}
      </section>

      {/* Identity */}
      <section className="-mt-14 relative px-2 sm:-mt-16">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative shrink-0">
              <img
                src={channel.avatar}
                alt={channel.fullname}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-base sm:h-28 sm:w-28"
              />
              {isOwnChannel && (
                <label className="absolute bottom-1 right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-base-raised text-ink ring-1 ring-base-border transition-colors hover:bg-base-hover">
                  <PlusIcon className="h-4 w-4" />
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              )}
            </div>

            <div className="min-w-0 pb-1">
              <h1 className="truncate font-display text-2xl font-semibold tracking-tight text-ink">
                {channel.fullname}
              </h1>
              <p className="mt-1 text-sm text-ink-dim">@{channel.username}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-dim">
                <span className="font-semibold text-ink">{channel.subscribersCount}</span>
                <span>subscribers</span>
                <span className="text-ink-faint">·</span>
                <span className="font-semibold text-ink">{channel.channelsSubscribedToCount}</span>
                <span>subscriptions</span>
              </div>
            </div>
          </div>

          <div className="pb-1">
            {isOwnChannel ? (
              <label className="btn-secondary cursor-pointer">
                Change avatar
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            ) : (
              <button
                onClick={handleToggleSubscribe}
                disabled={subLoading}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
                  channel.isSubscribed
                    ? 'border border-base-border text-ink hover:bg-base-hover'
                    : 'bg-ink text-base hover:bg-ink/90'
                }`}
              >
                {subLoading ? 'Updating...' : channel.isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Videos */}
      <section>
        <div className="mb-5 flex items-end justify-between border-b border-base-border pb-3">
          <h2 className="section-title">Videos</h2>
          <span className="text-sm text-ink-faint">{videos.length} videos</span>
        </div>

        {videos.length === 0 ? (
          <div className="surface flex min-h-48 flex-col items-center justify-center px-6 text-center">
            <h3 className="text-sm font-semibold text-ink">No videos published yet</h3>
            <p className="mt-1 text-xs text-ink-dim">
              Videos published on this channel will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
