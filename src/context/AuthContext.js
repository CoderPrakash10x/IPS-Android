import { createContext, useContext, useEffect, useState } from 'react'
import { api, saveToken, clearToken } from '../api/client'
import AsyncStorage from '@react-native-async-storage/async-storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const token = await AsyncStorage.getItem('ips_token')
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const data = await api.me()
        setUser(data.user)
      } catch {
        await clearToken()
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const login = async ({ email, password }) => {
    const data = await api.login({ email, password })
    await saveToken(data.token)
    setUser(data.user)
  }

  const signup = async ({ name, email, password }) => {
    await api.signup({ name, email, password })
  }

  const logout = async () => {
    await clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
