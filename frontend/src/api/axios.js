import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,  // send cookies automatically
})

// Only default to JSON when the payload isn't FormData. If we set
// Content-Type: application/json globally, axios won't let the
// browser attach the multipart boundary for file uploads (avatar,
// cover image, video upload/update), and those requests break.
api.interceptors.request.use((config) => {
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  }
  return config
})

// Interceptor to handle token refresh if needed.
//
// When several requests are in flight and the access token expires,
// they can all receive a 401 at roughly the same time. Without
// coordination each one would independently call /refresh-token,
// causing duplicate refresh requests and a race where one refresh
// can invalidate the token another retry is about to use.
//
// refreshPromise holds the single in-flight refresh call. The first
// 401 starts it; every other concurrent 401 awaits the same promise
// instead of starting its own, then retries once it resolves.
let refreshPromise = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (!refreshPromise) {
        refreshPromise = api
          .post('/users/refresh-token')
          .finally(() => {
            refreshPromise = null
          })
      }

      try {
        await refreshPromise
        return api(originalRequest)
      } catch (refreshError) {
        // Redirect to login if refresh fails
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export default api