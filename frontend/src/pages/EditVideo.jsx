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

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-4 w-72 animate-pulse rounded bg-slate-200" />
        </div>

        <div className="surface space-y-6 p-6">
          <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-36 animate-pulse rounded-xl bg-slate-200" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="surface mx-auto flex min-h-64 max-w-2xl flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-xl font-bold text-rose-500">
          !
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">
          Unable to edit this video
        </h2>
        <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
          Creator Studio
        </p>
        <h1 className="page-title">Edit Video</h1>
        <p className="page-subtitle">
          Update your video's details or replace its media files.
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
            Changes are applied when you save the video.
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
              placeholder="Video title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
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
              placeholder="Video description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea min-h-36"
              rows="5"
            />
          </div>

          <div className="border-t border-slate-100 pt-6">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Replace media
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Both files are optional. Leave them unchanged if you only want to edit the text.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="group relative flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-5 py-6 text-center transition-all hover:border-indigo-300 hover:bg-indigo-50/40">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  className="sr-only"
                />

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-600 transition-transform group-hover:scale-105">
                  ▶
                </div>

                <span className="mt-3 text-sm font-bold text-slate-900">
                  {videoFile ? 'New video selected' : 'Replace video'}
                </span>

                <span className="mt-1 max-w-full truncate text-xs text-slate-500">
                  {videoFile ? videoFile.name : 'Optional video file'}
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
                />

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-lg font-bold text-violet-600 transition-transform group-hover:scale-105">
                  ▧
                </div>

                <span className="mt-3 text-sm font-bold text-slate-900">
                  {thumbnail ? 'New thumbnail selected' : 'Replace thumbnail'}
                </span>

                <span className="mt-1 max-w-full truncate text-xs text-slate-500">
                  {thumbnail ? thumbnail.name : 'Optional image file'}
                </span>

                {!thumbnail && (
                  <span className="mt-3 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600 shadow-sm ring-1 ring-slate-200">
                    Browse files
                  </span>
                )}
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs leading-5 text-slate-500">
              Media replacement is optional. You can save just the title or description changes.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(`/video/${videoId}`)}
              className="btn-secondary w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full sm:w-auto"
            >
              {saving ? 'Saving changes...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )

}
