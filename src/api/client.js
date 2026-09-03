import AsyncStorage from '@react-native-async-storage/async-storage'

// Deployed backend on Render.
const API_BASE = 'https://ips-backend-rhoa.onrender.com/api'

const TOKEN_KEY = 'ips_token'

async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY)
}

export async function saveToken(token) {
  await AsyncStorage.setItem(TOKEN_KEY, token)
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY)
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = await getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`)
  }
  return data
}

export const api = {
  signup: (payload) => request('/auth/signup', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me'),

  listConversations: () => request('/conversations'),
  getConversation: (id) => request(`/conversations/${id}`),
  createConversation: (text) => request('/conversations', { method: 'POST', body: { text } }),
  addMessage: (id, text) => request(`/conversations/${id}/messages`, { method: 'POST', body: { text } }),
  deleteConversation: (id) => request(`/conversations/${id}`, { method: 'DELETE' }),
}