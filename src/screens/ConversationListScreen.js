import React, { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native'
import { Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import { useHistory } from '../context/HistoryContext'
import { colors } from '../theme/colors'

function timeAgo(iso) {
  const days = Math.floor(
    (Date.now() - new Date(iso).getTime()) / 86400000
  )

  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`

  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}

export default function ConversationListScreen({ navigation }) {
  const { user, logout } = useAuth()

  const {
    list,
    loadingList,
    refreshList,
    deleteConversation,
  } = useHistory()

  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await refreshList()
    setRefreshing(false)
  }

  const handleDelete = (id, title) => {
    Alert.alert(
      'Delete conversation?',
      title,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteConversation(id)
            } catch (err) {
              Alert.alert(
                'Error',
                err?.message || 'Could not delete'
              )
            }
          },
        },
      ]
    )
  }

  const sorted = [...list].sort(
    (a, b) =>
      new Date(b.updatedAt) - new Date(a.updatedAt)
  )

  const firstLetter =
    (user?.name || 'U').charAt(0).toUpperCase()

  return (
    <View style={styles.screen}>

      {/* Header */}
      <View style={styles.header}>

        <View style={styles.brandContainer}>
          <View style={styles.logoBox}>
            {/* Replace this Text with Image later */}
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View>
            <Text style={styles.brandName}>
              Indian Procurement
            </Text>
            <Text style={styles.brandSub}>
              Standards Intelligence
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          activeOpacity={0.7}
        >
          <Ionicons
            name="log-out-outline"
            size={19}
            color={colors.inkSoft}
          />
        </TouchableOpacity>

      </View>

      {/* Welcome */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeSmall}>
          PROCUREMENT WORKSPACE
        </Text>

        <Text style={styles.welcomeTitle}>
          Good to see you, {user?.name?.split(' ')[0] || 'there'}.
        </Text>

        <Text style={styles.welcomeSubtitle}>
          Find the right Indian Standards for your procurement
          specifications.
        </Text>
      </View>

      {/* New Search */}
      <TouchableOpacity
        style={styles.newButton}
        onPress={() =>
          navigation.navigate('Chat', {
            conversationId: null,
          })
        }
        activeOpacity={0.85}
      >
        <View style={styles.newIcon}>
          <Ionicons
            name="add"
            size={22}
            color={colors.onAccent}
          />
        </View>

        <View style={styles.newButtonContent}>
          <Text style={styles.newButtonTitle}>
            Start a new search
          </Text>

          <Text style={styles.newButtonSub}>
            Describe your procurement requirement
          </Text>
        </View>

        <Ionicons
          name="arrow-forward"
          size={19}
          color={colors.onAccent}
        />
      </TouchableOpacity>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Recent searches
          </Text>

          <Text style={styles.sectionSub}>
            Your procurement history
          </Text>
        </View>

        {list.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {list.length}
            </Text>
          </View>
        )}
      </View>

      {/* Conversations */}
      <FlatList
        data={sorted}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          sorted.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={
          !loadingList && (
            <View style={styles.emptyState}>

              <View style={styles.emptyLogo}>
                <Ionicons
                  name="search-outline"
                  size={25}
                  color={colors.accent}
                />
              </View>

              <Text style={styles.emptyTitle}>
                No searches yet
              </Text>

              <Text style={styles.emptyText}>
                Start your first procurement search and
                IPS will help identify applicable standards.
              </Text>

              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() =>
                  navigation.navigate('Chat', {
                    conversationId: null,
                  })
                }
              >
                <Text style={styles.emptyButtonText}>
                  Start searching
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={colors.onAccent}
                />
              </TouchableOpacity>

            </View>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('Chat', {
                conversationId: item._id,
              })
            }
            onLongPress={() =>
              handleDelete(
                item._id,
                item.title
              )
            }
            activeOpacity={0.75}
          >

            <View style={styles.cardIcon}>
              <Ionicons
                name="document-text-outline"
                size={19}
                color={colors.accent}
              />
            </View>

            <View style={styles.cardContent}>

              <Text
                style={styles.cardTitle}
                numberOfLines={2}
              >
                {item.title}
              </Text>

              <View style={styles.cardMeta}>
                <Ionicons
                  name="time-outline"
                  size={12}
                  color={colors.inkFaint}
                />

                <Text style={styles.cardTime}>
                  {timeAgo(item.updatedAt)}
                </Text>
              </View>

            </View>

            <Ionicons
              name="chevron-forward"
              size={17}
              color={colors.inkFaint}
            />

          </TouchableOpacity>
        )}
      />

      {/* User Footer */}
      <View style={styles.footer}>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {firstLetter}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <Text
            style={styles.userName}
            numberOfLines={1}
          >
            {user?.name || 'Guest'}
          </Text>

          <Text
            style={styles.userEmail}
            numberOfLines={1}
          >
            {user?.email || ''}
          </Text>
        </View>

        <View style={styles.secureBadge}>
          <Ionicons
            name="shield-checkmark-outline"
            size={15}
            color={colors.accent}
          />
        </View>

      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 54,
    paddingBottom: 15,
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoText: {
    color: colors.paper,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  logoImage: {
  width: 30,
  height: 30,
},

  brandName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },

  brandSub: {
    fontSize: 10.5,
    color: colors.inkFaint,
    marginTop: 2,
  },

  logoutButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panel,
  },

  welcomeSection: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
  },

  welcomeSmall: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.accent,
    marginBottom: 7,
  },

  welcomeTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.4,
  },

  welcomeSubtitle: {
    fontSize: 12.5,
    color: colors.inkSoft,
    lineHeight: 18,
    marginTop: 6,
    maxWidth: 340,
  },

  newButton: {
    marginHorizontal: 16,
    borderRadius: 17,
    backgroundColor: colors.accent,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },

  newIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  newButtonContent: {
    flex: 1,
    marginLeft: 11,
  },

  newButtonTitle: {
    color: colors.onAccent,
    fontSize: 14,
    fontWeight: '700',
  },

  newButtonSub: {
    color: colors.onAccent,
    opacity: 0.72,
    fontSize: 10.5,
    marginTop: 2,
  },

  sectionHeader: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },

  sectionSub: {
    fontSize: 11,
    color: colors.inkFaint,
    marginTop: 2,
  },

  countBadge: {
    minWidth: 27,
    height: 27,
    paddingHorizontal: 7,
    borderRadius: 9,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 15,
  },

  emptyList: {
    flexGrow: 1,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 13,
    marginBottom: 9,
  },

  cardIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardContent: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  cardTitle: {
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: '600',
    color: colors.ink,
  },

  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },

  cardTime: {
    fontSize: 10.5,
    color: colors.inkFaint,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
    paddingTop: 45,
  },

  emptyLogo: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
  },

  emptyText: {
    textAlign: 'center',
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.inkSoft,
    marginTop: 7,
  },

  emptyButton: {
    marginTop: 18,
    backgroundColor: colors.accent,
    borderRadius: 11,
    paddingHorizontal: 17,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  emptyButtonText: {
    color: colors.onAccent,
    fontSize: 12,
    fontWeight: '700',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.panel,
  },

  avatar: {
    width: 35,
    height: 35,
    borderRadius: 13,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: colors.accent,
    fontWeight: '800',
    fontSize: 13,
  },

  userInfo: {
    flex: 1,
    marginLeft: 10,
  },

  userName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.ink,
  },

  userEmail: {
    fontSize: 10.5,
    color: colors.inkFaint,
    marginTop: 2,
  },

  secureBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
})