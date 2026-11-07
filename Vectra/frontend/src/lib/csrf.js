import { API_BASE } from '../config'

export const getCsrfHeaders = async () => {
  const response = await fetch(`${API_BASE}/api/csrf`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Could not prepare a secure request.')
  }

  const { token, headerName } = await response.json()
  if (!token || !headerName) {
    throw new Error('Could not prepare a secure request.')
  }

  return { [headerName]: token }
}
