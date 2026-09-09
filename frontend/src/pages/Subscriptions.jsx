import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUserSubscriptions, toggleSubscription } from '../api/subscriptions'

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
      setSubscriptions(prev => prev.filter(sub => sub.channel?._id !== channelId))
    } catch (err) {
      alert('Failed to unsubscribe')
      console.log(err)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-4 w-72 animate-pulse rounded bg-slate-200" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(item => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="surface flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-xl font-bold text-rose-500">
          !
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">
          Something went wrong
        </h2>
        <p className="mt-1 text-sm text-slate-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
          Your Library
        </p>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="page-title">Your Subscriptions</h1>
            <p className="page-subtitle">
              Keep up with the channels you follow.
            </p>
          </div>

          {subscriptions.length > 0 && (
            <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
              {subscriptions.length} {subscriptions.length === 1 ? 'channel' : 'channels'}
            </span>
          )}
        </div>
      </header>

      {subscriptions.length === 0 ? (
        <div className="surface flex min-h-72 flex-col items-center justify-center px-6 py-14 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-2xl text-indigo-600">
            +
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900">
            No subscriptions yet
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Subscribe to channels you enjoy and they'll appear here for quick access.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((sub) => (
            <div
              key={sub._id}
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <Link
                to={`/c/${sub.channel?.username}`}
                className="flex min-w-0 flex-1 items-center gap-4"
              >
                <div className="relative shrink-0">
                  <img
                    src={sub.channel?.avatar}
                    alt={sub.channel?.fullname}
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-slate-100"
                  />
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
                    {sub.channel?.fullname}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-slate-500">
                    @{sub.channel?.username}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-400">
                    Subscribed channel
                  </p>
                </div>
              </Link>

              <button
                onClick={() => handleUnsubscribe(sub.channel?._id)}
                className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-4 focus:ring-rose-50"
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
