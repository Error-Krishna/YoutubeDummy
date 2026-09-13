import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getVideoComments, addComment, deleteComment } from '../api/comments'
import { timeAgo } from './VideoCard'
import { TrashIcon } from './icons'

export default function CommentsSection({ videoId }) {
  const { user, loading: authLoading } = useAuth()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [commentsLoading, setCommentsLoading] = useState(true)

  // Auth still resolving counts as loading too — whether to show the
  // comment composer or the "sign in" prompt (and each comment's own
  // delete button) depends on `user`, so this section shouldn't settle
  // into a state before auth is actually known.
  const loading = commentsLoading || authLoading

  useEffect(() => {
    let cancelled = false

    const fetchComments = async () => {
      try {
        const res = await getVideoComments(videoId)
        if (!cancelled) setComments(res.data.data)
      } catch (error) {
        console.error('Failed to fetch comments', error)
      } finally {
        if (!cancelled) setCommentsLoading(false)
      }
    }

    fetchComments()
    return () => {
      cancelled = true
    }
  }, [videoId])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    try {
      const res = await addComment(videoId, newComment)
      setComments([res.data.data, ...comments])
      setNewComment('')
    } catch (error) {
      alert('Failed to add comment')
      console.log(error)
    }
  }

  const handleDelete = async (commentId) => {
    if (!confirm('Delete this comment?')) return
    try {
      await deleteComment(commentId)
      setComments(comments.filter((c) => c._id !== commentId))
    } catch (error) {
      alert('Failed to delete comment')
      console.log(error)
    }
  }

  if (loading) {
    return (
      <section className="mt-8">
        <div className="shimmer mb-4 h-6 w-32 rounded" />
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex gap-3">
              <div className="shimmer h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="shimmer h-4 w-32 rounded" />
                <div className="shimmer h-4 w-3/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mt-8 border-t border-base-border pt-6">
      <div className="mb-5 flex items-center gap-2.5">
        <h3 className="section-title">Comments</h3>
        <span className="pill">{comments.length}</span>
      </div>

      {user ? (
        <form onSubmit={handleAdd} className="mb-8 flex gap-3">
          <img
            src={user.avatar}
            alt={user.fullname}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1 border-b border-base-border pb-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full border-0 bg-transparent py-2 text-sm text-ink outline-none placeholder:text-ink-faint"
            />
            {newComment.trim() && (
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setNewComment('')}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-3.5 py-1.5 text-xs">
                  Comment
                </button>
              </div>
            )}
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded-xl border border-dashed border-base-border bg-base-raised px-5 py-4 text-center">
          <p className="text-sm text-ink-dim">Sign in to join the conversation.</p>
        </div>
      )}

      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((c) => (
            <article key={c._id} className="group flex gap-3">
              <img
                src={c.owner?.avatar}
                alt={c.owner?.fullname || 'User'}
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-sm font-semibold text-ink">{c.owner?.fullname}</span>
                  <span className="text-xs text-ink-faint">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink-dim">
                  {c.content}
                </p>

                {user && user._id === c.owner?._id && (
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="mt-1.5 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-ink-faint opacity-100 transition-colors hover:bg-coral-soft hover:text-coral sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Delete
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-base-raised px-6 py-10 text-center">
          <h4 className="text-sm font-semibold text-ink">No comments yet</h4>
          <p className="mt-1 text-xs text-ink-dim">Be the first to start the conversation.</p>
        </div>
      )}
    </section>
  )
}
