import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

export default function Register() {
  const [form, setForm] = useState({ fullname: '', email: '', username: '', password: '' })
  const [avatar, setAvatar] = useState(null)
  const [coverImage, setCoverImage] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!avatar) {
      setError('Avatar image is required')
      return
    }

    const fd = new FormData()
    fd.append('fullname', form.fullname)
    fd.append('email', form.email)
    fd.append('username', form.username)
    fd.append('password', form.password)
    fd.append('avatar', avatar)
    if (coverImage) fd.append('coverImage', coverImage)

    setSubmitting(true)
    try {
      await register(fd)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-softCard p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-center mb-4">Register</h2>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="fullname" placeholder="Full Name" value={form.fullname} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
        <div>
          <label className="block text-sm font-medium mb-1">Avatar (required)</label>
          <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cover Image (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files[0])} />
        </div>
        <button type="submit" disabled={submitting} className="w-full bg-softPrimary text-white py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50">
          {submitting ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="text-sm text-center mt-3">
        Already have an account? <Link to="/login" className="text-softSecondary hover:underline">Login</Link>
      </p>
    </div>
  )
}
