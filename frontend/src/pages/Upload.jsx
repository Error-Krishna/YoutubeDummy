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
    <div className="max-w-2xl mx-auto bg-softCard p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Upload Video</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          rows="4"
          required
        />
        <div>
          <label className="block text-sm font-medium mb-1">Video File</label>
          <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Thumbnail</label>
          <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files[0])} required />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-softPrimary text-white py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Publish Video'}
        </button>
      </form>
    </div>
  )
}