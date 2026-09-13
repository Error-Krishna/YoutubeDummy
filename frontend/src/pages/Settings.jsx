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
    <div className="page-shell mx-auto max-w-2xl space-y-8">
      <header>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account information and security preferences.</p>
      </header>

      <section className="surface overflow-hidden">
        <div className="border-b border-base-border px-5 py-4">
          <h2 className="text-sm font-semibold text-ink">Account details</h2>
          <p className="mt-0.5 text-xs text-ink-dim">Update your personal account information.</p>
        </div>

        <form onSubmit={handleAccountSubmit} className="space-y-4 p-5">
          {accountError && (
            <div className="rounded-lg border border-coral/30 bg-coral-soft px-4 py-3 text-sm text-coral">
              {accountError}
            </div>
          )}
          {accountMessage && (
            <div className="rounded-lg border border-mint/30 bg-mint-soft px-4 py-3 text-sm text-mint">
              {accountMessage}
            </div>
          )}

          <div>
            <label htmlFor="fullname" className="label">Full name</label>
            <input
              id="fullname"
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="email" className="label">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>

          <div className="flex justify-end border-t border-base-border pt-4">
            <button type="submit" disabled={accountSaving} className="btn-primary w-full sm:w-auto">
              {accountSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>

      <section className="surface overflow-hidden">
        <div className="border-b border-base-border px-5 py-4">
          <h2 className="text-sm font-semibold text-ink">Change password</h2>
          <p className="mt-0.5 text-xs text-ink-dim">Keep your account secure with a strong password.</p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 p-5">
          {passwordError && (
            <div className="rounded-lg border border-coral/30 bg-coral-soft px-4 py-3 text-sm text-coral">
              {passwordError}
            </div>
          )}
          {passwordMessage && (
            <div className="rounded-lg border border-mint/30 bg-mint-soft px-4 py-3 text-sm text-mint">
              {passwordMessage}
            </div>
          )}

          <div>
            <label htmlFor="old-password" className="label">Current password</label>
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
            <label htmlFor="new-password" className="label">New password</label>
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
            <label htmlFor="confirm-password" className="label">Confirm new password</label>
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

          <div className="flex justify-end border-t border-base-border pt-4">
            <button type="submit" disabled={passwordSaving} className="btn-primary w-full sm:w-auto">
              {passwordSaving ? 'Updating...' : 'Change password'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
