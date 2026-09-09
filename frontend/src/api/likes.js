import api from './axios'

export const likeVideo = (videoId) => api.post(`/likes/video/${videoId}`)
export const likeComment = (commentId) => api.post(`/likes/comment/${commentId}`)
export const likeTweet = (tweetId) => api.post(`/likes/tweet/${tweetId}`)
export const getLikedVideos = () => api.get('/likes/videos')