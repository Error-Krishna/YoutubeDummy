import { createContext, useContext, useState, useEffect } from 'react'
import { getCurrentUser } from '../api/auth'
import api from '../api/axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser()
        setUser(res.data.data)
      } catch (error) {
        console.log(error);
        
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const login = async (email, username, password) => {
    const res = await api.post('/users/login', { email, username, password })
    setUser(res.data.data.user)
    return res
  }

  const logout = async () => {
    await api.post('/users/logout')
    setUser(null)
  }

  const register = async (data) => {
    const res = await api.post('/users/register', data)
    return res
  }

  const value = { user, setUser, loading, login, logout, register }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)