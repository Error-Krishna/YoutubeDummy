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
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Account Details</h2>
        <form onSubmit={handleAccountSubmit} className="bg-softCard p-6 rounded-xl shadow-md space-y-4">
          {accountError && <p className="text-red-500 text-sm">{accountError}</p>}
          {accountMessage && <p className="text-green-600 text-sm">{accountMessage}</p>}
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-softPrimary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-softPrimary"
            />
          </div>
          <button
            type="submit"
            disabled={accountSaving}
            className="bg-softPrimary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50"
          >
            {accountSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="bg-softCard p-6 rounded-xl shadow-md space-y-4">
          {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
          {passwordMessage && <p className="text-green-600 text-sm">{passwordMessage}</p>}
          <input
            type="password"
            placeholder="Current password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-softPrimary"
            required
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-softPrimary"
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-softPrimary"
            required
          />
          <button
            type="submit"
            disabled={passwordSaving}
            className="bg-softPrimary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50"
          >
            {passwordSaving ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
