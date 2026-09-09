import api from './axios'

export const getAllVideos = (params) => api.get('/videos', { params })
export const getVideoById = (videoId) => api.get(`/videos/${videoId}`)
export const uploadVideo = (formData) => api.post('/videos/upload', formData)
export const updateVideo = (videoId, formData) => api.patch(`/videos/${videoId}`, formData)
export const deleteVideo = (videoId) => api.delete(`/videos/${videoId}`)
export const togglePublish = (videoId) => api.post(`/videos/${videoId}`)