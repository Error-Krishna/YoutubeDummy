import api from './axios'

export const register = (data) => api.post('/users/register', data)
export const login = (data) => api.post('/users/login', data)
export const logout = () => api.post('/users/logout')
export const getCurrentUser = () => api.get('/users/current-user')
export const changePassword = (data) => api.post('/users/change-password', data)
export const updateAccount = (data) => api.patch('/users/update-account', data)
export const updateAvatar = (formData) => api.patch('/users/avatar', formData)
export const updateCover = (formData) => api.patch('/users/cover-image', formData)
export const getChannelProfile = (username) => api.get(`/users/c/${username}`)
export const getWatchHistory = () => api.get('/users/history')