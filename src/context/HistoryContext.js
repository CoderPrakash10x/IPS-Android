import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from './AuthContext'

const HistoryContext = createContext(null)

export function HistoryProvider({ children }) {
  const { user } = useAuth()
  const [list, setList] = useState([])
  const [conversations, setConversations] = useState({})
  const [loadingList, setLoadingList] = useState(false)

  const refreshList = useCallback(async () => {
    if (!user) return
    setLoadingList(true)
    try {
      const data = await api.listConversations()
      setList(data.conversations)
    } finally {
      setLoadingList(false)
    }
  }, [user])

  useEffect(() => {
    if (user) refreshList()
    else {
      setList([])
      setConversations({})
    }
  }, [user, refreshList])

  const loadConversation = useCallback(async (id) => {
    const data = await api.getConversation(id)
    setConversations((prev) => ({ ...prev, [id]: data.conversation }))
    return data.conversation
  }, [])

  const createConversation = async (text) => {
    const data = await api.createConversation(text)
    setConversations((prev) => ({ ...prev, [data.conversation._id]: data.conversation }))
    await refreshList()
    return data.conversation._id
  }

  const sendMessage = async (id, text) => {
    const data = await api.addMessage(id, text)
    setConversations((prev) => ({ ...prev, [id]: data.conversation }))
    refreshList()
    return data.message
  }

  const deleteConversation = async (id) => {
    await api.deleteConversation(id)
    setList((prev) => prev.filter((c) => c._id !== id))
    setConversations((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  return (
    <HistoryContext.Provider
      value={{
        list,
        conversations,
        loadingList,
        refreshList,
        loadConversation,
        createConversation,
        sendMessage,
        deleteConversation,
      }}
    >
      {children}
    </HistoryContext.Provider>
  )
}

export function useHistory() {
  return useContext(HistoryContext)
}
