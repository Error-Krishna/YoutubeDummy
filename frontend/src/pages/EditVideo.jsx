import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getVideoById, updateVideo } from '../api/videos'
import { useAuth } from '../context/AuthContext'

export default function EditVideo() {
  const { videoId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getVideoById(videoId)
        const video = res.data.data
        if (user && video.owner?._id !== user._id) {
          setError('You are not authorized to edit this video')
          return
        }
        setTitle(video.title)
        setDescription(video.description)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load video')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [videoId, user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData()
    if (title.trim()) fd.append('title', title)
    if (description.trim()) fd.append('description', description)
    if (videoFile) fd.append('videoFile', videoFile)
    if (thumbnail) fd.append('thumbnail', thumbnail)

    setSaving(true)
    try {
      await updateVideo(videoId, fd)
      navigate(`/video/${videoId}`)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update video')
      console.log(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-10">Loading...</div>
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>

  return (
    <div className="max-w-2xl mx-auto bg-softCard p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Edit Video</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          rows="4"
        />
        <div>
          <label className="block text-sm font-medium mb-1">Replace Video File (optional)</label>
          <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Replace Thumbnail (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files[0])} />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-softPrimary text-white py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
