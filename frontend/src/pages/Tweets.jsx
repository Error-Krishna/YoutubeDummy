import { useEffect, useState } from 'react'
import { getUserTweets, createTweet, updateTweet, deleteTweet } from '../api/tweets'
import { likeTweet } from '../api/likes'
import { useAuth } from '../context/AuthContext'

export default function Tweets() {
  const { user } = useAuth()
  const [tweets, setTweets] = useState([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')

  const fetchTweets = async () => {
    try {
      const res = await getUserTweets()
      setTweets(res.data.data)
    } catch (err) {
      console.error('Failed to load tweets', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTweets()
  }, [])

  const handlePost = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setPosting(true)
    try {
      const res = await createTweet(content)
      setTweets(prev => [res.data.data, ...prev])
      setContent('')
    } catch (err) {
      alert('Failed to post tweet')
      console.log(err)
    } finally {
      setPosting(false)
    }
  }

  const startEdit = (tweet) => {
    setEditingId(tweet._id)
    setEditContent(tweet.content)
  }

  const handleSaveEdit = async (tweetId) => {
    if (!editContent.trim()) return
    try {
      const res = await updateTweet(tweetId, editContent)
      setTweets(prev => prev.map(t => t._id === tweetId ? res.data.data : t))
      setEditingId(null)
    } catch (err) {
      alert('Failed to update tweet')
      console.log(err)
    }
  }

  const handleDelete = async (tweetId) => {
    if (!confirm('Delete this tweet?')) return
    try {
      await deleteTweet(tweetId)
      setTweets(prev => prev.filter(t => t._id !== tweetId))
    } catch (err) {
      alert('Failed to delete tweet')
      console.log(err)
    }
  }

  const handleLike = async (tweetId) => {
    try {
      await likeTweet(tweetId)
    } catch (err) {
      alert('Failed to like tweet')
      console.log(err)
    }
  }

  if (loading) return <div className="text-center py-10">Loading tweets...</div>

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Your Tweets</h1>

      <form onSubmit={handlePost} className="bg-softCard p-4 rounded-lg shadow-sm mb-6 flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-softPrimary"
        />
        <button
          type="submit"
          disabled={posting}
          className="bg-softPrimary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50"
        >
          {posting ? 'Posting...' : 'Tweet'}
        </button>
      </form>

      {tweets.length === 0 ? (
        <p className="text-gray-400">No tweets yet.</p>
      ) : (
        <div className="space-y-3">
          {tweets.map((tweet) => (
            <div key={tweet._id} className="bg-softCard p-4 rounded-lg shadow-sm">
              {editingId === tweet._id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(tweet._id)}
                      className="text-xs bg-softPrimary text-white px-3 py-1 rounded-lg hover:bg-opacity-90"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-800">{tweet.content}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-400">{new Date(tweet.createdAt).toLocaleString()}</span>
                    <button onClick={() => handleLike(tweet._id)} className="text-xs text-softSecondary hover:underline">
                      Like
                    </button>
                    {user?._id === tweet.owner && (
                      <>
                        <button onClick={() => startEdit(tweet)} className="text-xs text-gray-500 hover:underline">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(tweet._id)} className="text-xs text-red-500 hover:underline">
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
