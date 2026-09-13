import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getVideoById, updateVideo } from '../api/videos'
import { useAuth } from '../context/AuthContext'
import { UploadIcon, ImageIcon } from '../components/icons'

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

  if (loading) {
    return (
      <div className="page-shell mx-auto max-w-2xl space-y-6">
        <div className="shimmer h-8 w-48 rounded" />
        <div className="surface space-y-5 p-5">
          <div className="shimmer h-11 rounded-lg" />
          <div className="shimmer h-32 rounded-lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="surface mx-auto flex min-h-56 max-w-lg flex-col items-center justify-center px-6 text-center">
        <h2 className="text-base font-semibold text-ink">Unable to edit this video</h2>
        <p className="mt-1 text-sm text-ink-dim">{error}</p>
      </div>
    )
  }

  return (
    <div className="page-shell mx-auto max-w-2xl">
      <header className="mb-6">
        <h1 className="page-title">Edit video</h1>
        <p className="page-subtitle">Update your video's details or replace its media files.</p>
      </header>

      <form onSubmit={handleSubmit} className="surface overflow-hidden">
        <div className="border-b border-base-border px-5 py-4">
          <h2 className="text-sm font-semibold text-ink">Video details</h2>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <label htmlFor="video-title" className="label">Title</label>
            <input
              id="video-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="video-description" className="label">Description</label>
            <textarea
              id="video-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea min-h-32"
            />
          </div>

          <div className="border-t border-base-border pt-5">
            <p className="mb-3 text-xs text-ink-dim">
              Both files are optional. Leave them unchanged if you only want to edit the text.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="group relative flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-base-border bg-base px-5 py-5 text-center transition-colors hover:border-mint/50">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  className="sr-only"
                />
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint-soft text-mint">
                  <UploadIcon className="h-4.5 w-4.5" />
                </div>
                <span className="mt-2.5 text-sm font-semibold text-ink">
                  {videoFile ? 'New video selected' : 'Replace video'}
                </span>
                <span className="mt-1 max-w-full truncate text-xs text-ink-faint">
                  {videoFile ? videoFile.name : 'Optional'}
                </span>
              </label>

              <label className="group relative flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-base-border bg-base px-5 py-5 text-center transition-colors hover:border-mint/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files[0])}
                  className="sr-only"
                />
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-base-hover text-ink-dim">
                  <ImageIcon className="h-4.5 w-4.5" />
                </div>
                <span className="mt-2.5 text-sm font-semibold text-ink">
                  {thumbnail ? 'New thumbnail selected' : 'Replace thumbnail'}
                </span>
                <span className="mt-1 max-w-full truncate text-xs text-ink-faint">
                  {thumbnail ? thumbnail.name : 'Optional'}
                </span>
              </label>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-base-border pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(`/video/${videoId}`)}
              className="btn-secondary w-full sm:w-auto"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
              {saving ? 'Saving changes...' : 'Save changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
