export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const getCsrfHeaders = () => {
  const csrfCookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))

  if (!csrfCookie) return {}

  const token = decodeURIComponent(csrfCookie.split('=')[1])

  return {
    'X-XSRF-TOKEN': token,
  }
}