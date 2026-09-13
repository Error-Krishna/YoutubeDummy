import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getPlaylistById,
  removeVideoFromPlaylist,
  updatePlaylist,
  deletePlaylist,
} from '../api/playlists'
import { PlaylistIcon } from '../components/icons'

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
      // The remove endpoint returns the raw playlist doc with an
      // unpopulated `videos` array (just ids), so refetch the fully
      // populated playlist instead of using the mutation response directly.
      await removeVideoFromPlaylist(playlistId, videoId)
      await fetchPlaylist()
    } catch (err) {
      alert('Failed to remove video')
      console.log(err)
    }
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      // The update endpoint returns the raw playlist doc with an
      // unpopulated `videos` array (just ids), so only merge the fields
      // that actually changed (name/description) instead of overwriting
      // the whole playlist with the mutation response.
      const res = await updatePlaylist(playlistId, { name, description })
      setPlaylist((prev) => ({
        ...prev,
        name: res.data.data.name,
        description: res.data.data.description,
      }))
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
      <div className="page-shell space-y-6">
        <div className="shimmer h-44 rounded-xl" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shimmer h-24 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !playlist) {
    return (
      <div className="surface mx-auto flex min-h-56 max-w-lg flex-col items-center justify-center text-center">
        <h2 className="text-base font-semibold text-ink">Unable to load playlist</h2>
        <p className="mt-1 text-sm text-ink-dim">{error || 'This playlist may have been removed.'}</p>
      </div>
    )
  }

  return (
    <div className="page-shell space-y-6">
      {editing ? (
        <form onSubmit={handleSaveEdit} className="surface overflow-hidden">
          <div className="border-b border-base-border px-5 py-4">
            <p className="text-sm font-semibold text-ink">Edit playlist</p>
          </div>

          <div className="space-y-4 p-5">
            <div>
              <label htmlFor="playlist-name" className="label">Playlist name</label>
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
              <label htmlFor="playlist-description" className="label">Description</label>
              <textarea
                id="playlist-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea"
                required
              />
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <header className="surface overflow-hidden">
          <div className="px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-mint-soft text-mint">
                  <PlaylistIcon className="h-5 w-5" />
                </div>
                <h1 className="break-words font-display text-2xl font-semibold tracking-tight text-ink">
                  {playlist.name}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-dim">{playlist.description}</p>
              </div>

              <div className="flex shrink-0 gap-2">
                <button onClick={() => setEditing(true)} className="btn-secondary">
                  Edit
                </button>
                <button onClick={handleDeletePlaylist} className="btn-danger">
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-base-border px-6 py-3 text-sm text-ink-dim sm:px-8">
            {playlist.videos?.length || 0} {playlist.videos?.length === 1 ? 'video' : 'videos'}
          </div>
        </header>
      )}

      <section>
        <div className="mb-4 flex items-end justify-between border-b border-base-border pb-3">
          <h2 className="section-title">Videos</h2>
        </div>

        {!playlist.videos || playlist.videos.length === 0 ? (
          <div className="surface flex min-h-56 flex-col items-center justify-center px-6 py-12 text-center">
            <h3 className="text-base font-semibold text-ink">This playlist is empty</h3>
            <p className="mt-1 max-w-sm text-sm text-ink-dim">
              Add videos to this playlist and they'll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {playlist.videos.map((video, index) => (
              <div key={video._id} className="surface flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
                <span className="hidden w-6 shrink-0 text-center text-xs font-semibold text-ink-faint sm:block">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <Link
                  to={`/video/${video._id}`}
                  className="relative w-28 shrink-0 overflow-hidden rounded-lg bg-base-hover sm:w-40"
                >
                  <div className="aspect-video">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    to={`/video/${video._id}`}
                    className="clamp-2 text-sm font-semibold leading-5 text-ink hover:text-mint sm:text-base"
                  >
                    {video.title}
                  </Link>
                  <p className="mt-1 hidden clamp-2 text-sm text-ink-dim sm:block">{video.description}</p>
                  <p className="mt-1.5 text-xs text-ink-faint">{video.views} views</p>
                </div>

                <button
                  onClick={() => handleRemoveVideo(video._id)}
                  className="shrink-0 rounded-full border border-base-border px-3 py-1.5 text-xs font-semibold text-ink-dim transition-colors hover:border-coral/30 hover:bg-coral-soft hover:text-coral"
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
