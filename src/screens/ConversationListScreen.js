import { useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, Alert,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { useHistory } from '../context/HistoryContext'
import { colors } from '../theme/colors'

function timeAgo(iso) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function ConversationListScreen({ navigation }) {
  const { user, logout } = useAuth()
  const { list, loadingList, refreshList, deleteConversation } = useHistory()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await refreshList()
    setRefreshing(false)
  }

  const handleDelete = (id, title) => {
    Alert.alert('Delete conversation?', title, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteConversation(id)
          } catch (err) {
            Alert.alert('Error', err.message || 'Could not delete')
          }
        },
      },
    ])
  }

  const sorted = [...list].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>IPS</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.newButton}
        onPress={() => navigation.navigate('Chat', { conversationId: null })}
      >
        <Text style={styles.newButtonText}>+ New search</Text>
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>CONVERSATIONS</Text>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          !loadingList && (
            <Text style={styles.empty}>No conversations yet — start a new search.</Text>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('Chat', { conversationId: item._id })}
            onLongPress={() => handleDelete(item._id, item.title)}
          >
            <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.rowTime}>{timeAgo(item.updatedAt)}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.name || 'U').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName} numberOfLines={1}>{user?.name || 'Guest'}</Text>
          <Text style={styles.userEmail} numberOfLines={1}>{user?.email || ''}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 56, paddingBottom: 16,
  },
  headerTitle: { fontSize: 19, fontWeight: '700', color: colors.ink },
  logout: { fontSize: 13, color: colors.inkSoft },
  newButton: {
    marginHorizontal: 16, backgroundColor: colors.accent, borderRadius: 12,
    paddingVertical: 12, alignItems: 'center', marginBottom: 18,
  },
  newButtonText: { color: colors.onAccent, fontWeight: '700', fontSize: 14 },
  sectionLabel: {
    fontSize: 11, fontWeight: '600', color: colors.inkFaint,
    letterSpacing: 0.6, marginLeft: 18, marginBottom: 6,
  },
  row: {
    paddingHorizontal: 18, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  rowTitle: { fontSize: 14, color: colors.ink, marginBottom: 2 },
  rowTime: { fontSize: 11.5, color: colors.inkFaint },
  empty: { textAlign: 'center', color: colors.inkFaint, marginTop: 32, fontSize: 13 },
  footer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 18, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: colors.line,
  },
  avatar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: colors.accent, fontWeight: '700', fontSize: 13 },
  userName: { fontSize: 13, fontWeight: '600', color: colors.ink },
  userEmail: { fontSize: 11.5, color: colors.inkFaint },
})
