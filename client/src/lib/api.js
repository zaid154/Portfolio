import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('portfolio_admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// If the session expires (401) on an authenticated call, drop the token and
// bounce back to the login page so the user isn't stuck on a broken dashboard.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401 && localStorage.getItem('portfolio_admin_token')) {
      localStorage.removeItem('portfolio_admin_token')
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        window.location.assign('/admin')
      }
    }
    return Promise.reject(error)
  }
)

export function getErrorMessage(error) {
  if (error?.response?.data?.message) return error.response.data.message
  // No response = the API server is unreachable (usually it isn't running).
  if (error?.code === 'ERR_NETWORK' || (error?.request && !error?.response)) {
    return 'Cannot reach the server. Start the backend with "npm run dev".'
  }
  return error?.message || 'Something went wrong'
}
