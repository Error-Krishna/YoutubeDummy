import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getPlaylistById,
  removeVideoFromPlaylist,
  updatePlaylist,
  deletePlaylist
} from '../api/playlists'

export default function PlaylistDetails() {
  const { playlistId } = useParams()
  const navigate = useNavigate()
  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchPlaylist = useCallback(async () => {
    try {
      const res = await getPlaylistById(playlistId)
      setPlaylist(res.data.data)
      setName(res.data.data.name)
      setDescription(res.data.data.description)
    } catch (err) {
      console.error('Failed to load playlist', err)
      setError(err.response?.data?.message || 'Failed to load playlist')
    } finally {
      setLoading(false)
    }
  }, [playlistId])

  useEffect(() => {
    fetchPlaylist()
  }, [fetchPlaylist])

  const handleRemoveVideo = async (videoId) => {
    try {
      const res = await removeVideoFromPlaylist(playlistId, videoId)
      setPlaylist(res.data.data)
    } catch (err) {
      alert('Failed to remove video')
      console.log(err)
    }
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await updatePlaylist(playlistId, { name, description })
      setPlaylist(res.data.data)
      setEditing(false)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update playlist')
      console.log(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePlaylist = async () => {
    if (!confirm('Delete this playlist?')) return
    try {
      await deletePlaylist(playlistId)
      navigate('/playlists')
    } catch (err) {
      alert('Failed to delete playlist')
      console.log(err)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-56 animate-pulse rounded-3xl border border-slate-200 bg-white" />
        <div className="space-y-3">
          {[1, 2, 3].map(item => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="surface flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-xl font-bold text-rose-500">
          !
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">
          Unable to load playlist
        </h2>
        <p className="mt-1 text-sm text-slate-500">{error}</p>
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="surface flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-500">
          ?
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">
          Playlist not found
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          This playlist may have been removed or is no longer available.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {editing ? (
        <form
          onSubmit={handleSaveEdit}
          className="surface overflow-hidden"
        >
          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
            <p className="text-sm font-bold text-slate-900">Edit playlist</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Update the name and description of your collection.
            </p>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <div>
              <label
                htmlFor="playlist-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Playlist name
              </label>
              <input
                id="playlist-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label
                htmlFor="playlist-description"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Description
              </label>
              <textarea
                id="playlist-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea"
                rows="4"
                required
              />
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 px-6 py-8 text-white sm:px-8 sm:py-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold ring-1 ring-white/20">
                  ▤
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100">
                  Playlist
                </p>
                <h1 className="mt-2 break-words text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {playlist.name}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
                  {playlist.description}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/25"
                >
                  Edit
                </button>
                <button
                  onClick={handleDeletePlaylist}
                  className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 shadow-sm transition-colors hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-100 px-6 py-4 text-sm sm:px-8">
            <span className="font-semibold text-slate-900">
              {playlist.videos?.length || 0}{' '}
              {playlist.videos?.length === 1 ? 'video' : 'videos'}
            </span>
            <span className="text-slate-400">
              Curated collection
            </span>
          </div>
        </header>
      )}

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="section-title">Videos</h2>
            <p className="mt-1 text-sm text-slate-500">
              Videos saved in this playlist.
            </p>
          </div>
          {playlist.videos?.length > 0 && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {playlist.videos.length}
            </span>
          )}
        </div>

        {(!playlist.videos || playlist.videos.length === 0) ? (
          <div className="surface flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-xl font-bold text-indigo-600">
              ▶
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              This playlist is empty
            </h3>
            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
              Add videos to this playlist and they'll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {playlist.videos.map((video, index) => (
              <div
                key={video._id}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md sm:gap-4 sm:p-4"
              >
                <span className="hidden w-6 shrink-0 text-center text-xs font-bold text-slate-300 sm:block">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <Link
                  to={`/video/${video._id}`}
                  className="relative w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:w-40"
                >
                  <div className="aspect-video">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    to={`/video/${video._id}`}
                    className="line-clamp-2 text-sm font-bold leading-5 text-slate-900 transition-colors hover:text-indigo-600 sm:text-base"
                  >
                    {video.title}
                  </Link>
                  <p className="mt-1 hidden line-clamp-1 text-sm text-slate-500 sm:block">
                    {video.description}
                  </p>
                  <p className="mt-1.5 text-xs font-medium text-slate-400">
                    {video.views} views
                  </p>
                </div>

                <button
                  onClick={() => handleRemoveVideo(video._id)}
                  className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )

}
