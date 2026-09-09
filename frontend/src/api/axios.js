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

// Interceptor to handle token refresh if needed (optional)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        await api.post('/users/refresh-token')
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