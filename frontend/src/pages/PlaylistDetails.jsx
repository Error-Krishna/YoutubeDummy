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

  if (loading) return <div className="text-center py-10">Loading playlist...</div>
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>
  if (!playlist) return <div className="text-center py-10">Playlist not found</div>

  return (
    <div>
      {editing ? (
        <form onSubmit={handleSaveEdit} className="bg-softCard p-4 rounded-lg shadow-sm mb-6 space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            rows="2"
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-softPrimary text-white px-4 py-2 rounded-lg text-sm hover:bg-opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">{playlist.name}</h1>
            <p className="text-gray-500 mt-1">{playlist.description}</p>
          </div>
          <div className="flex gap-2 shrink-0 ml-4">
            <button
              onClick={() => setEditing(true)}
              className="text-sm bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200"
            >
              Edit
            </button>
            <button
              onClick={handleDeletePlaylist}
              className="text-sm bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {(!playlist.videos || playlist.videos.length === 0) ? (
        <p className="text-gray-400">No videos in this playlist yet.</p>
      ) : (
        <div className="space-y-3">
          {playlist.videos.map((video) => (
            <div key={video._id} className="flex items-center gap-3 bg-softCard p-3 rounded-lg shadow-sm">
              <Link to={`/video/${video._id}`} className="shrink-0">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-32 aspect-video object-cover rounded-md bg-gray-200"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/video/${video._id}`} className="font-medium text-gray-800 line-clamp-1 hover:underline">
                  {video.title}
                </Link>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{video.description}</p>
                <p className="text-xs text-gray-400 mt-1">{video.views} views</p>
              </div>
              <button
                onClick={() => handleRemoveVideo(video._id)}
                className="text-xs text-red-500 hover:underline shrink-0"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
