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

  if (loading) return <div className="text-center py-10">Loading subscriptions...</div>
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Your Subscriptions</h1>
      {subscriptions.length === 0 ? (
        <p className="text-gray-400">You haven't subscribed to any channels yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map((sub) => (
            <div key={sub._id} className="bg-softCard p-4 rounded-lg shadow-sm flex items-center gap-3">
              <Link to={`/c/${sub.channel?.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                <img
                  src={sub.channel?.avatar}
                  alt={sub.channel?.fullname}
                  className="w-12 h-12 rounded-full object-cover border"
                />
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate">{sub.channel?.fullname}</p>
                  <p className="text-sm text-gray-500 truncate">@{sub.channel?.username}</p>
                </div>
              </Link>
              <button
                onClick={() => handleUnsubscribe(sub.channel?._id)}
                className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 shrink-0"
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
