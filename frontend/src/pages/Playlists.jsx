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

  if (loading) return <div className="text-center py-10">Loading playlists...</div>
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Your Playlists</h1>
        <button
          onClick={() => setShowForm(s => !s)}
          className="bg-softPrimary text-white px-4 py-2 rounded-lg text-sm hover:bg-opacity-90"
        >
          {showForm ? 'Cancel' : 'New Playlist'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-softCard p-4 rounded-lg shadow-sm mb-6 space-y-3">
          <input
            type="text"
            placeholder="Playlist name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            rows="2"
            required
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-softPrimary text-white px-4 py-2 rounded-lg text-sm hover:bg-opacity-90 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}

      {playlists.length === 0 ? (
        <p className="text-gray-400">You haven't created any playlists yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((playlist) => (
            <div key={playlist._id} className="bg-softCard rounded-lg shadow-sm p-4 flex flex-col">
              <Link to={`/playlist/${playlist._id}`} className="flex-1">
                <h3 className="font-medium text-gray-800">{playlist.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{playlist.description}</p>
                <p className="text-xs text-gray-400 mt-2">{playlist.videos?.length || 0} videos</p>
              </Link>
              <button
                onClick={() => handleDelete(playlist._id)}
                className="text-xs text-red-500 hover:underline mt-3 self-start"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
