import { createContext, useContext, useState, useEffect } from 'react'
import { getCurrentUser } from '../api/auth'
import api from '../api/axios'

// ---------------------------------------------------------------------------
// Auth-state UX convention (read this before rendering anything based on
// `user` in a new component):
//
//   loading (true)  -> render a shimmer/skeleton matching the real content's
//                      dimensions. Never render the signed-in OR signed-out
//                      UI yet -- both are unknown until loading is false.
//   loading (false) + user present  -> render the authenticated UI.
//   loading (false) + user absent   -> render the signed-out UI.
//
// `loading` here only tells you whether the initial /users/current-user
// check has finished. If a component has its OWN async fetch (e.g. a
// video, a channel, a comment list) and that fetch's result also depends
// on `user` (owner checks, like state, a composer vs. a sign-in prompt),
// combine both flags before deciding what to show:
//
//   const { user, loading: authLoading } = useAuth()
//   const [dataLoading, setDataLoading] = useState(true)
//   const loading = authLoading || dataLoading
//
// Never gate only on the component's own fetch and ignore authLoading --
// the two requests race independently, so on a hard refresh the page's
// data can resolve before auth does, showing the wrong owner/subscribe/
// like state for a moment before it snaps to the correct one.
// ---------------------------------------------------------------------------

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