import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { PlayIcon, ImageIcon } from '../components/icons'

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
    <div className="flex justify-center py-6 sm:py-10">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-mint text-base">
            <PlayIcon className="h-5 w-5" />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-ink-dim">Join Reel and start sharing what you make</p>
        </div>

        <div className="surface p-6">
          {error && (
            <div className="mb-5 rounded-lg border border-coral/30 bg-coral-soft px-4 py-3 text-sm font-medium text-coral">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input
                name="fullname"
                placeholder="Your full name"
                value={form.fullname}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Username</label>
              <input
                name="username"
                placeholder="Choose a username"
                value={form.username}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                name="password"
                type="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">
                Profile picture <span className="text-coral">*</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-base-border bg-base px-4 py-3 transition-colors hover:border-mint/50">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-base-hover text-ink-dim">
                  <ImageIcon className="h-4.5 w-4.5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">
                    {avatar ? avatar.name : 'Choose profile picture'}
                  </span>
                  <span className="block text-xs text-ink-faint">JPG, PNG or other image</span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatar(e.target.files[0])}
                  className="hidden"
                  required
                />
              </label>
            </div>

            <div>
              <label className="label">
                Cover image <span className="font-normal normal-case text-ink-faint">(optional)</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-base-border bg-base px-4 py-3 transition-colors hover:border-mint/50">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-base-hover text-ink-dim">
                  <ImageIcon className="h-4.5 w-4.5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">
                    {coverImage ? coverImage.name : 'Choose cover image'}
                  </span>
                  <span className="block text-xs text-ink-faint">Optional channel banner</span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverImage(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="my-6 h-px bg-base-border" />

          <p className="text-center text-sm text-ink-dim">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-mint hover:text-mint-dim">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
