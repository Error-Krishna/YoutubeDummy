import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadVideo } from '../api/videos'
import { UploadIcon, ImageIcon } from '../components/icons'

export default function Upload() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!videoFile || !thumbnail) return alert('Please select both video and thumbnail')
    const fd = new FormData()
    fd.append('title', title)
    fd.append('description', description)
    fd.append('videoFile', videoFile)
    fd.append('thumbnail', thumbnail)
    setUploading(true)
    try {
      await uploadVideo(fd)
      navigate('/')
    } catch (error) {
      alert('Upload failed: ' + error.response?.data?.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="page-shell mx-auto max-w-2xl">
      <header className="mb-6">
        <h1 className="page-title">Upload video</h1>
        <p className="page-subtitle">Share your next video with your audience.</p>
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
              placeholder="Give your video a clear, engaging title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="video-description" className="label">Description</label>
            <textarea
              id="video-description"
              placeholder="Tell viewers what your video is about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea min-h-32"
              required
            />
          </div>

          <div className="border-t border-base-border pt-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="group relative flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-base-border bg-base px-5 py-6 text-center transition-colors hover:border-mint/50">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  className="sr-only"
                  required
                />
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint-soft text-mint">
                  <UploadIcon className="h-5 w-5" />
                </div>
                <span className="mt-3 text-sm font-semibold text-ink">
                  {videoFile ? 'Video selected' : 'Choose video'}
                </span>
                <span className="mt-1 max-w-full truncate text-xs text-ink-faint">
                  {videoFile ? videoFile.name : 'MP4, WebM or other video file'}
                </span>
              </label>

              <label className="group relative flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-base-border bg-base px-5 py-6 text-center transition-colors hover:border-mint/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files[0])}
                  className="sr-only"
                  required
                />
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-hover text-ink-dim">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <span className="mt-3 text-sm font-semibold text-ink">
                  {thumbnail ? 'Thumbnail selected' : 'Choose thumbnail'}
                </span>
                <span className="mt-1 max-w-full truncate text-xs text-ink-faint">
                  {thumbnail ? thumbnail.name : 'JPG, PNG or other image file'}
                </span>
              </label>
            </div>
          </div>

          <div className="border-t border-base-border pt-5">
            <button type="submit" disabled={uploading} className="btn-primary w-full py-2.5">
              {uploading ? 'Uploading video...' : 'Publish video'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
