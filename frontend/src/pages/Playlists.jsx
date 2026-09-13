import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUserPlaylists, createPlaylist, deletePlaylist } from '../api/playlists'
import { PlaylistIcon, PlusIcon, XIcon } from '../components/icons'

export default function Playlists() {
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchPlaylists = async () => {
    try {
      const res = await getUserPlaylists()
      setPlaylists(res.data.data)
    } catch (err) {
      console.error('Failed to load playlists', err)
      setError('Failed to load playlists')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlaylists()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim() || !description.trim()) return
    setCreating(true)
    try {
      const res = await createPlaylist({ name, description })
      setPlaylists((prev) => [res.data.data, ...prev])
      setName('')
      setDescription('')
      setShowForm(false)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create playlist')
      console.log(err)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (playlistId) => {
    if (!confirm('Delete this playlist?')) return
    try {
      await deletePlaylist(playlistId)
      setPlaylists((prev) => prev.filter((p) => p._id !== playlistId))
    } catch (err) {
      alert('Failed to delete playlist')
      console.log(err)
    }
  }

  if (loading) {
    return (
      <div className="page-shell space-y-8">
        <div className="shimmer h-8 w-48 rounded" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shimmer h-48 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="surface mx-auto flex min-h-56 max-w-lg flex-col items-center justify-center text-center">
        <h2 className="text-base font-semibold text-ink">Something went wrong</h2>
        <p className="mt-1 text-sm text-ink-dim">{error}</p>
      </div>
    )
  }

  return (
    <div className="page-shell space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Your playlists</h1>
          <p className="page-subtitle">Organize your favorite videos into collections.</p>
        </div>

        <button onClick={() => setShowForm((s) => !s)} className="btn-primary w-full sm:w-auto">
          {showForm ? <XIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
          {showForm ? 'Cancel' : 'New playlist'}
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleCreate} className="surface overflow-hidden">
          <div className="border-b border-base-border px-5 py-4">
            <p className="text-sm font-semibold text-ink">Create a playlist</p>
          </div>

          <div className="space-y-4 p-5">
            <div>
              <label htmlFor="playlist-name" className="label">Playlist name</label>
              <input
                id="playlist-name"
                type="text"
                placeholder="e.g. Weekend watchlist"
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
                placeholder="What kind of videos belong in this playlist?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea min-h-24"
                required
              />
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={creating} className="btn-primary">
                {creating ? 'Creating...' : 'Create playlist'}
              </button>
            </div>
          </div>
        </form>
      )}

      {playlists.length === 0 ? (
        <div className="surface flex min-h-64 flex-col items-center justify-center px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mint-soft text-mint">
            <PlaylistIcon className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-ink">No playlists yet</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-ink-dim">
            Create your first playlist to organize videos you want to watch again.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <div key={playlist._id} className="surface flex flex-col overflow-hidden">
              <Link to={`/playlist/${playlist._id}`} className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint-soft text-mint">
                    <PlaylistIcon className="h-4.5 w-4.5" />
                  </div>
                  <span className="pill">
                    {playlist.videos?.length || 0} {playlist.videos?.length === 1 ? 'video' : 'videos'}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-ink transition-colors hover:text-mint">
                  {playlist.name}
                </h3>
                <p className="mt-2 clamp-2 text-sm leading-6 text-ink-dim">{playlist.description}</p>
              </Link>

              <div className="border-t border-base-border px-5 py-2.5">
                <button
                  onClick={() => handleDelete(playlist._id)}
                  className="text-xs font-medium text-ink-faint transition-colors hover:text-coral"
                >
                  Delete playlist
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
