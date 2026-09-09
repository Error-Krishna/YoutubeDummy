import api from './axios'

export const getUserTweets = () => api.get('/tweets')
export const createTweet = (content) => api.post('/tweets', { content })
export const updateTweet = (tweetId, content) => api.patch(`/tweets/${tweetId}`, { content })
export const deleteTweet = (tweetId) => api.delete(`/tweets/${tweetId}`)
