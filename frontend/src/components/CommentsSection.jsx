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

  if (loading) return <div className="text-gray-500">Loading comments...</div>

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Comments ({comments.length})</h3>
      {user && (
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-softPrimary"
          />
          <button type="submit" className="bg-softPrimary text-white px-4 py-2 rounded-lg hover:bg-opacity-90">
            Post
          </button>
        </form>
      )}
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c._id} className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
            <img src={c.owner?.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{c.owner?.fullname}</span>
                <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm mt-1">{c.content}</p>
              {user && user._id === c.owner?._id && (
                <button onClick={() => handleDelete(c._id)} className="text-xs text-red-500 mt-1 hover:underline">
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="text-gray-400">No comments yet.</p>}
      </div>
    </div>
  )
}