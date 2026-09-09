import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getVideoComments, addComment, deleteComment } from '../api/comments'

export default function CommentsSection({ videoId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchComments = async () => {
      try {
        const res = await getVideoComments(videoId)
        if (!cancelled) {
          setComments(res.data.data)
        }
      } catch (error) {
        console.error('Failed to fetch comments', error)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
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
      console.log(error);
      
    }
  }

  const handleDelete = async (commentId) => {
    if (!confirm('Delete this comment?')) return
    try {
      await deleteComment(commentId)
      setComments(comments.filter(c => c._id !== commentId))
    } catch (error) {
      alert('Failed to delete comment')
      console.log(error);
      
    }
  }

  if (loading) {
    return (
      <section className="mt-8">
        <div className="mb-4 h-6 w-32 animate-pulse rounded bg-slate-200" />
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mt-8 border-t border-slate-200 pt-8">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
            Comments
          </h3>

          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
            {comments.length}
          </span>
        </div>

        {comments.length > 0 && (
          <span className="text-xs font-medium text-slate-400">
            Join the conversation
          </span>
        )}
      </div>

      {/* Add comment */}
      {user ? (
        <form
          onSubmit={handleAdd}
          className="mb-8 flex gap-3"
        >
          <img
            src={user.avatar}
            alt={user.fullname}
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
          />

          <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition-all focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full border-0 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
            />

            <div className="flex justify-end border-t border-slate-100 pt-2">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="btn-primary px-3 py-1.5 text-xs"
              >
                Post Comment
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-4 text-center">
          <p className="text-sm text-slate-500">
            Sign in to join the conversation.
          </p>
        </div>
      )}

      {/* Comments */}
      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((c) => (
            <article
              key={c._id}
              className="group flex gap-3"
            >
              <img
                src={c.owner?.avatar}
                alt={c.owner?.fullname || 'User'}
                className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-sm font-bold text-slate-900">
                    {c.owner?.fullname}
                  </span>

                  <span className="text-xs text-slate-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {c.content}
                </p>

                {user && user._id === c.owner?._id && (
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="mt-2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 opacity-100 transition-colors hover:bg-rose-50 hover:text-rose-600 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    Delete
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-50 px-6 py-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg shadow-sm ring-1 ring-slate-200">
            💬
          </div>

          <h4 className="text-sm font-bold text-slate-900">
            No comments yet
          </h4>

          <p className="mt-1 text-xs text-slate-500">
            Be the first to start the conversation.
          </p>
        </div>
      )}
    </section>
  )

}