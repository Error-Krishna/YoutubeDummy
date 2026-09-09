import api from './axios'

export const toggleSubscription = (channelId) => api.post(`/subscriptions/${channelId}`)
export const getUserSubscriptions = () => api.get('/subscriptions')
export const checkSubscription = (channelId) => api.get(`/subscriptions/${channelId}`)