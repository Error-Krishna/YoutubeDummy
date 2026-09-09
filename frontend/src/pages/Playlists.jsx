import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUserPlaylists, createPlaylist, deletePlaylist } from '../api/playlists'

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
      setPlaylists(prev => [res.data.data, ...prev])
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
      setPlaylists(prev => prev.filter(p => p._id !== playlistId))
    } catch (err) {
      alert('Failed to delete playlist')
      console.log(err)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-4 w-72 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="h-11 w-32 animate-pulse rounded-xl bg-slate-200" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(item => (
            <div
              key={item}
              className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white"
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
          Something went wrong
        </h2>
        <p className="mt-1 text-sm text-slate-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
            Your Library
          </p>
          <h1 className="page-title">Your Playlists</h1>
          <p className="page-subtitle">
            Organize your favorite videos into collections.
          </p>
        </div>

        <button
          onClick={() => setShowForm(s => !s)}
          className="btn-primary w-full sm:w-auto"
        >
          <span className="mr-2 text-lg leading-none">
            {showForm ? '×' : '+'}
          </span>
          {showForm ? 'Cancel' : 'New Playlist'}
        </button>
      </header>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="surface overflow-hidden"
        >
          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
            <p className="text-sm font-bold text-slate-900">Create a playlist</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Give your collection a name and a short description.
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
                placeholder="e.g. Weekend watchlist"
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
                placeholder="What kind of videos belong in this playlist?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea"
                rows="3"
                required
              />
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="btn-primary"
              >
                {creating ? 'Creating...' : 'Create Playlist'}
              </button>
            </div>
          </div>
        </form>
      )}

      {playlists.length === 0 ? (
        <div className="surface flex min-h-72 flex-col items-center justify-center px-6 py-14 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-2xl font-bold text-indigo-600">
            ▤
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900">
            No playlists yet
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Create your first playlist to organize videos you want to watch again.
          </p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-secondary mt-5"
            >
              Create your first playlist
            </button>
          )}
        </div>
      ) : (
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="section-title">Collections</h2>
              <p className="mt-1 text-sm text-slate-500">
                {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {playlists.map((playlist) => (
              <div
                key={playlist._id}
                className="group flex min-h-52 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
              >
                <Link
                  to={`/playlist/${playlist._id}`}
                  className="flex flex-1 flex-col"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-br from-indigo-50 to-slate-50 px-5 py-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-bold text-indigo-600 shadow-sm ring-1 ring-indigo-100">
                      ▤
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
                      {playlist.videos?.length || 0}{' '}
                      {playlist.videos?.length === 1 ? 'video' : 'videos'}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-base font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
                      {playlist.name}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                      {playlist.description}
                    </p>

                    <span className="mt-auto pt-5 text-xs font-bold text-indigo-600">
                      Open playlist →
                    </span>
                  </div>
                </Link>

                <div className="border-t border-slate-100 px-5 py-3">
                  <button
                    onClick={() => handleDelete(playlist._id)}
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    Delete playlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )

}
