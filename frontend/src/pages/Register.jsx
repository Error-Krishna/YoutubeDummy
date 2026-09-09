import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

export default function Register() {
  const [form, setForm] = useState({
    fullname: '',
    email: '',
    username: '',
    password: ''
  })

  const [avatar, setAvatar] = useState(null)
  const [coverImage, setCoverImage] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

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

    if (coverImage) {
      fd.append('coverImage', coverImage)
    }

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
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-extrabold text-white shadow-lg shadow-indigo-600/20">
            T
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Join TubeSoft and start sharing your videos
          </p>
        </div>

        {/* Card */}
        <div className="surface p-6 shadow-sm sm:p-8">

          {error && (
            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Full name
              </label>

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
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Email
              </label>

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
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Username
              </label>

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
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Password
              </label>

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

            {/* Avatar */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Profile picture
                <span className="ml-1 text-red-500">*</span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 transition-colors hover:border-indigo-400 hover:bg-indigo-50/50">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm ring-1 ring-slate-200">
                  +
                </span>

                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-700">
                    {avatar ? avatar.name : 'Choose profile picture'}
                  </span>
                  <span className="block text-xs text-slate-400">
                    JPG, PNG or other image
                  </span>
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

            {/* Cover image */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Cover image
                <span className="ml-1 font-normal text-slate-400">
                  (optional)
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 transition-colors hover:border-indigo-400 hover:bg-indigo-50/50">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm ring-1 ring-slate-200">
                  +
                </span>

                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-700">
                    {coverImage ? coverImage.name : 'Choose cover image'}
                  </span>
                  <span className="block text-xs text-slate-400">
                    Optional channel banner
                  </span>
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverImage(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
            >
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="my-6 h-px bg-slate-200" />

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
