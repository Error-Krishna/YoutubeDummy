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

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-slate-200" />
        </div>

        <div className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />

        {[1, 2, 3].map(item => (
          <div
            key={item}
            className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
          Social
        </p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <div>
            <h1 className="page-title">Your Tweets</h1>
            <p className="page-subtitle">
              Share updates and thoughts with your audience.
            </p>
          </div>

          {tweets.length > 0 && (
            <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
              {tweets.length} {tweets.length === 1 ? 'post' : 'posts'}
            </span>
          )}
        </div>
      </header>

      <form
        onSubmit={handlePost}
        className="surface overflow-hidden"
      >
        <div className="flex gap-3 p-4 sm:p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-extrabold text-indigo-600">
            T
          </div>

          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              className="w-full border-0 bg-transparent px-0 py-1 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
            />

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-400">
                Share something with your audience
              </span>

              <button
                type="submit"
                disabled={posting}
                className="btn-primary px-4 py-2"
              >
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {tweets.length === 0 ? (
        <div className="surface flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-xl font-bold text-indigo-600">
            T
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">
            No posts yet
          </h2>
          <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
            Your thoughts and updates will appear here after you publish your first post.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tweets.map((tweet) => (
            <article
              key={tweet._id}
              className="surface overflow-hidden transition-shadow duration-200 hover:shadow-md"
            >
              {editingId === tweet._id ? (
                <div className="space-y-4 p-4 sm:p-5">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Edit post
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Update your post before saving.
                    </p>
                  </div>

                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="input"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="btn-secondary px-3 py-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(tweet._id)}
                      className="btn-primary px-3 py-2"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-5">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-extrabold text-white">
                      T
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-sm font-bold text-slate-900">
                          Your post
                        </span>
                        <span className="text-xs text-slate-400">
                          · {new Date(tweet.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-6 text-slate-700">
                        {tweet.content}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-slate-100 pt-3">
                        <button
                          onClick={() => handleLike(tweet._id)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                        >
                          ♥ Like
                        </button>

                        {user?._id === tweet.owner && (
                          <>
                            <button
                              onClick={() => startEdit(tweet)}
                              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(tweet._id)}
                              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )

}
