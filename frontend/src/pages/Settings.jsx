import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { changePassword, updateAccount } from '../api/auth'

export default function Settings() {
  const { user, setUser } = useAuth()
  const [fullname, setFullname] = useState(user?.fullname || '')
  const [email, setEmail] = useState(user?.email || '')
  const [accountSaving, setAccountSaving] = useState(false)
  const [accountMessage, setAccountMessage] = useState('')
  const [accountError, setAccountError] = useState('')

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleAccountSubmit = async (e) => {
    e.preventDefault()
    setAccountError('')
    setAccountMessage('')
    setAccountSaving(true)
    try {
      const res = await updateAccount({ fullname, email })
      setUser(res.data.data)
      setAccountMessage('Account details updated successfully')
    } catch (err) {
      setAccountError(err.response?.data?.message || 'Failed to update account')
    } finally {
      setAccountSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordMessage('')

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match')
      return
    }

    setPasswordSaving(true)
    try {
      await changePassword({ oldPassword, newPassword, confirmPassword })
      setPasswordMessage('Password changed successfully')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
          Account
        </p>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">
          Manage your account information and security preferences.
        </p>
      </header>

      <section className="surface overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
              @
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Account Details
              </h2>
              <p className="text-xs text-slate-500">
                Update your personal account information.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleAccountSubmit} className="space-y-5 p-5 sm:p-6">
          {accountError && (
            <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {accountError}
            </div>
          )}

          {accountMessage && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600">
              {accountMessage}
            </div>
          )}

          <div>
            <label
              htmlFor="fullname"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Full Name
            </label>
            <input
              id="fullname"
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={accountSaving}
              className="btn-primary w-full sm:w-auto"
            >
              {accountSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>

      <section className="surface overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-sm font-bold text-violet-600">
              •••
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Change Password
              </h2>
              <p className="text-xs text-slate-500">
                Keep your account secure with a strong password.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-5 p-5 sm:p-6">
          {passwordError && (
            <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {passwordError}
            </div>
          )}

          {passwordMessage && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600">
              {passwordMessage}
            </div>
          )}

          <div>
            <label
              htmlFor="old-password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Current Password
            </label>
            <input
              id="old-password"
              type="password"
              placeholder="Enter your current password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label
              htmlFor="new-password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              placeholder="Enter a new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              required
            />
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={passwordSaving}
              className="btn-primary w-full sm:w-auto"
            >
              {passwordSaving ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )

}
