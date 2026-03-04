import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// On 401, redirect to login
api.interceptors.response.use(
    (res) => res,
    (err) => {
        // Bypass 401 redirection to login
        return Promise.reject(err)
    }
)

export default api
