import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUserTweets, createTweet, updateTweet, deleteTweet } from '../api/tweets'
import { likeTweet } from '../api/likes'
import { useAuth } from '../context/AuthContext'
import { timeAgo } from '../components/VideoCard'
import { HeartIcon, EditIcon, TrashIcon, PulseIcon } from '../components/icons'

export default function Pulse() {
  const { user, loading: authLoading } = useAuth()
  const [tweets, setTweets] = useState([])
  const [tweetsLoading, setTweetsLoading] = useState(true)
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')

  // Auth still resolving (e.g. on a hard refresh) counts as loading too,
  // so this page doesn't flash the "sign in" prompt before we actually
  // know whether the user is authenticated.
  const loading = authLoading || tweetsLoading

  const fetchTweets = async () => {
    if (!user) {
      setTweetsLoading(false)
      return
    }
    try {
      // getUserTweets now returns isLiked / likesCount per tweet (computed
      // server-side against the Likes collection), so like status is
      // persistent across reloads instead of being local-only state.
      const res = await getUserTweets()
      setTweets(res.data.data)
    } catch (err) {
      console.error('Failed to load tweets', err)
    } finally {
      setTweetsLoading(false)
    }
  }

  useEffect(() => {
    // Wait for auth to resolve before deciding whether to fetch tweets or
    // show the signed-out state — otherwise a hard refresh briefly shows
    // "sign in to Pulse" before the current-user check comes back.
    if (authLoading) return
    fetchTweets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading])

  const handlePost = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setPosting(true)
    try {
      // createTweet doesn't run the like-aggregation, so a freshly
      // created tweet has no isLiked/likesCount fields yet. Default
      // them explicitly rather than leaving them undefined.
      const res = await createTweet(content)
      setTweets((prev) => [{ ...res.data.data, isLiked: false, likesCount: 0 }, ...prev])
      setContent('')
    } catch (err) {
      alert('Failed to post')
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
      // updateTweet's response also lacks isLiked/likesCount, so merge
      // only the content field instead of replacing the whole tweet
      // (which would wipe out its existing like state).
      const res = await updateTweet(tweetId, editContent)
      setTweets((prev) =>
        prev.map((t) => (t._id === tweetId ? { ...t, content: res.data.data.content } : t))
      )
      setEditingId(null)
    } catch (err) {
      alert('Failed to update post')
      console.log(err)
    }
  }

  const handleDelete = async (tweetId) => {
    if (!confirm('Delete this post?')) return
    try {
      await deleteTweet(tweetId)
      setTweets((prev) => prev.filter((t) => t._id !== tweetId))
    } catch (err) {
      alert('Failed to delete post')
      console.log(err)
    }
  }

  const handleLike = async (tweetId) => {
    if (!user) return alert('Please sign in to like posts')
    try {
      // {} means unliked, a like document means liked — derive the new
      // state from the response instead of blindly flipping, and update
      // the like count alongside it so both stay in sync.
      const res = await likeTweet(tweetId)
      const nowLiked = Boolean(res.data.data?._id)
      setTweets((prev) =>
        prev.map((t) =>
          t._id === tweetId
            ? {
                ...t,
                isLiked: nowLiked,
                likesCount: Math.max(0, (t.likesCount || 0) + (nowLiked ? 1 : -1)),
              }
            : t
        )
      )
    } catch (err) {
      alert('Failed to like post')
      console.log(err)
    }
  }

  if (!user && !loading) {
    return (
      <div className="page-shell mx-auto max-w-xl">
        <div className="surface flex min-h-72 flex-col items-center justify-center px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mint-soft text-mint">
            <PulseIcon className="h-6 w-6" />
          </div>
          <h2 className="mt-5 font-display text-xl font-semibold text-ink">
            Pulse is where creators post updates
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-ink-dim">
            Sign in to write posts and see what you've shared with your audience.
          </p>
          <Link to="/login" className="btn-primary mt-6">
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page-shell mx-auto max-w-xl space-y-5">
        <div className="shimmer h-28 rounded-xl" />
        {[1, 2, 3].map((item) => (
          <div key={item} className="shimmer h-32 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="page-shell mx-auto max-w-xl space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Pulse</h1>
          <p className="page-subtitle">Your posts and updates for your audience.</p>
        </div>
        {tweets.length > 0 && (
          <span className="pill-accent shrink-0">
            {tweets.length} {tweets.length === 1 ? 'post' : 'posts'}
          </span>
        )}
      </header>

      <form onSubmit={handlePost} className="surface overflow-hidden">
        <div className="flex gap-3 p-4">
          <img
            src={user.avatar}
            alt={user.fullname}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share an update with your audience..."
              rows={content ? 3 : 1}
              className="w-full resize-none border-0 bg-transparent py-1 text-[15px] text-ink outline-none placeholder:text-ink-faint"
            />
            <div className="mt-3 flex items-center justify-between border-t border-base-border pt-3">
              <span className="text-xs text-ink-faint">{content.length}/280</span>
              <button
                type="submit"
                disabled={posting || !content.trim()}
                className="btn-primary px-4 py-1.5 text-sm"
              >
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {tweets.length === 0 ? (
        <div className="surface flex min-h-56 flex-col items-center justify-center px-6 py-12 text-center">
          <h2 className="text-base font-semibold text-ink">No posts yet</h2>
          <p className="mt-1 max-w-sm text-sm text-ink-dim">
            Your updates will appear here after you publish your first post.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tweets.map((tweet) => (
            <article key={tweet._id} className="surface p-4">
              {editingId === tweet._id ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="textarea"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="btn-secondary px-3 py-1.5 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(tweet._id)}
                      className="btn-primary px-3 py-1.5 text-xs"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <img
                    src={user.avatar}
                    alt={user.fullname}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-sm font-semibold text-ink">{user.fullname}</span>
                      <span className="text-xs text-ink-faint">@{user.username}</span>
                      <span className="text-xs text-ink-faint">· {timeAgo(tweet.createdAt)}</span>
                    </div>

                    <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-6 text-ink">
                      {tweet.content}
                    </p>

                    <div className="mt-3 flex items-center gap-1 border-t border-base-border pt-2.5">
                      <button
                        onClick={() => handleLike(tweet._id)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                          tweet.isLiked
                            ? 'text-coral'
                            : 'text-ink-faint hover:bg-coral-soft hover:text-coral'
                        }`}
                      >
                        <HeartIcon filled={tweet.isLiked} className="h-3.5 w-3.5" />
                        {tweet.likesCount > 0 ? tweet.likesCount : 'Like'}
                      </button>

                      <button
                        onClick={() => startEdit(tweet)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink-faint transition-colors hover:bg-base-hover hover:text-ink"
                      >
                        <EditIcon className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(tweet._id)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink-faint transition-colors hover:bg-coral-soft hover:text-coral"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        Delete
                      </button>
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
