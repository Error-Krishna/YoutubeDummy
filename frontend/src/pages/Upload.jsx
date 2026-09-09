import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadVideo } from '../api/videos'

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
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
          Creator Studio
        </p>
        <h1 className="page-title">Upload Video</h1>
        <p className="page-subtitle">
          Share your next video with your audience.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="surface overflow-hidden"
      >
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">
          <h2 className="text-base font-bold text-slate-900">
            Video details
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Add the information viewers will see when they discover your video.
          </p>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <div>
            <label
              htmlFor="video-title"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Title
            </label>
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
            <label
              htmlFor="video-description"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Description
            </label>
            <textarea
              id="video-description"
              placeholder="Tell viewers what your video is about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea min-h-36"
              rows="5"
              required
            />
          </div>

          <div className="border-t border-slate-100 pt-6">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Media files
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Choose the video and thumbnail you want to publish.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="group relative flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-5 py-6 text-center transition-all hover:border-indigo-300 hover:bg-indigo-50/40">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  className="sr-only"
                  required
                />

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-600 transition-transform group-hover:scale-105">
                  ▶
                </div>

                <span className="mt-3 text-sm font-bold text-slate-900">
                  {videoFile ? 'Video selected' : 'Choose video'}
                </span>

                <span className="mt-1 max-w-full truncate text-xs text-slate-500">
                  {videoFile ? videoFile.name : 'MP4, WebM or other video file'}
                </span>

                {!videoFile && (
                  <span className="mt-3 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600 shadow-sm ring-1 ring-slate-200">
                    Browse files
                  </span>
                )}
              </label>

              <label className="group relative flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-5 py-6 text-center transition-all hover:border-indigo-300 hover:bg-indigo-50/40">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files[0])}
                  className="sr-only"
                  required
                />

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-lg font-bold text-violet-600 transition-transform group-hover:scale-105">
                  ▧
                </div>

                <span className="mt-3 text-sm font-bold text-slate-900">
                  {thumbnail ? 'Thumbnail selected' : 'Choose thumbnail'}
                </span>

                <span className="mt-1 max-w-full truncate text-xs text-slate-500">
                  {thumbnail ? thumbnail.name : 'JPG, PNG or other image file'}
                </span>

                {!thumbnail && (
                  <span className="mt-3 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600 shadow-sm ring-1 ring-slate-200">
                    Browse files
                  </span>
                )}
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
            <p className="text-xs leading-5 text-indigo-700">
              Your video and thumbnail are required before you can publish.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={uploading}
              className="btn-primary w-full py-3"
            >
              {uploading ? 'Uploading video...' : 'Publish Video'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )

}