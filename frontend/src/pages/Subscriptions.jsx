import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUserSubscriptions, toggleSubscription } from '../api/subscriptions'
import { PlusIcon } from '../components/icons'

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchSubscriptions = async () => {
    try {
      const res = await getUserSubscriptions()
      setSubscriptions(res.data.data)
    } catch (err) {
      console.error('Failed to load subscriptions', err)
      setError('Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const handleUnsubscribe = async (channelId) => {
    try {
      await toggleSubscription(channelId)
      setSubscriptions((prev) => prev.filter((sub) => sub.channel?._id !== channelId))
    } catch (err) {
      alert('Failed to unsubscribe')
      console.log(err)
    }
  }

  if (loading) {
    return (
      <div className="page-shell space-y-8">
        <div className="shimmer h-8 w-56 rounded" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shimmer h-24 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="surface mx-auto flex min-h-56 max-w-lg flex-col items-center justify-center text-center">
        <h2 className="text-base font-semibold text-ink">Something went wrong</h2>
        <p className="mt-1 text-sm text-ink-dim">{error}</p>
      </div>
    )
  }

  return (
    <div className="page-shell space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Your subscriptions</h1>
          <p className="page-subtitle">Keep up with the channels you follow.</p>
        </div>
        {subscriptions.length > 0 && (
          <span className="pill-accent w-fit">{subscriptions.length} {subscriptions.length === 1 ? 'channel' : 'channels'}</span>
        )}
      </header>

      {subscriptions.length === 0 ? (
        <div className="surface flex min-h-64 flex-col items-center justify-center px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mint-soft text-mint">
            <PlusIcon className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-ink">No subscriptions yet</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-ink-dim">
            Subscribe to channels you enjoy and they'll appear here for quick access.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((sub) => (
            <div key={sub._id} className="surface flex items-center gap-4 p-4">
              <Link to={`/c/${sub.channel?.username}`} className="flex min-w-0 flex-1 items-center gap-3">
                <img
                  src={sub.channel?.avatar}
                  alt={sub.channel?.fullname}
                  className="h-12 w-12 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink transition-colors hover:text-mint">
                    {sub.channel?.fullname}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink-dim">@{sub.channel?.username}</p>
                </div>
              </Link>

              <button
                onClick={() => handleUnsubscribe(sub.channel?._id)}
                className="shrink-0 rounded-full border border-base-border px-3 py-1.5 text-xs font-semibold text-ink-dim transition-colors hover:border-coral/30 hover:bg-coral-soft hover:text-coral"
              >
                Unsubscribe
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
