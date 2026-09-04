import { useEffect, useRef, useState } from 'react'

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native'
import { Image } from 'react-native'

import { useHistory } from '../context/HistoryContext'
import { colors } from '../theme/colors'

const SAMPLE_QUERY =
  'Supply and installation of hot-rolled structural steel sections for a warehouse frame, load-bearing, weather-exposed, IS-compliant grade required.'

export default function ChatScreen({ route, navigation }) {
  const initialId = route.params?.conversationId || null
  const [conversationId, setConversationId] = useState(initialId)

  const {
    conversations,
    loadConversation,
    createConversation,
    sendMessage,
  } = useHistory()

  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)
  const [loadingConv, setLoadingConv] = useState(false)

  const listRef = useRef(null)

  const conversation = conversationId
    ? conversations[conversationId]
    : null

  const messages = conversation?.messages || []

  useEffect(() => {
    navigation.setOptions({
      title: conversation?.title || 'New search',
      headerStyle: {
        backgroundColor: colors.paper,
      },
      headerTintColor: colors.ink,
      headerShadowVisible: false,
      headerTitleStyle: {
        fontSize: 16,
        fontWeight: '700',
      },
    })
  }, [conversation, navigation])

  useEffect(() => {
    if (conversationId && !conversations[conversationId]) {
      setLoadingConv(true)

      loadConversation(conversationId)
        .catch((err) => Alert.alert('Error', err.message))
        .finally(() => setLoadingConv(false))
    }
  }, [conversationId])

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({
          animated: true,
        })
      }, 100)
    }
  }, [messages.length, pending])

  const handleSend = async (text) => {
    const value = text ?? draft

    if (!value.trim() || pending) return

    Keyboard.dismiss()
    setDraft('')
    setPending(true)

    try {
      if (!conversationId) {
        const id = await createConversation(value)
        setConversationId(id)
      } else {
        await sendMessage(conversationId, value)
      }
    } catch (err) {
      Alert.alert(
        'Error',
        err.message || 'Something went wrong'
      )
    } finally {
      setPending(false)
    }
  }

  const isEmpty = !conversationId

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {isEmpty ? (
        <View style={styles.emptyScreen}>

          {/* Branding */}
          <View style={styles.heroLogo}>
            <Image
  source={require('../../assets/logo.png')}
  style={styles.logoImage}
  resizeMode="contain"
/>
          </View>

          <Text style={styles.emptyTitle}>
            What are you procuring today?
          </Text>

          <Text style={styles.emptySubtitle}>
            Describe the product or service and IPS will
            recommend applicable Indian Standards,
            allied references and certification needs.
          </Text>

          {/* Composer */}
          <View style={styles.emptyComposerArea}>
            <Composer
              value={draft}
              onChange={setDraft}
              onSend={handleSend}
              disabled={pending}
            />

            {/* Sample */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleSend(SAMPLE_QUERY)}
              disabled={pending}
              style={styles.sampleButton}
            >
              <View style={styles.sampleIcon}>
                <Text style={styles.sampleIconText}>✦</Text>
              </View>

              <View style={styles.sampleContent}>
                <Text style={styles.sampleTitle}>
                  Try a sample specification
                </Text>

                <Text style={styles.sampleSubtitle}>
                  See how IPS recommends applicable standards
                </Text>
              </View>

              <Text style={styles.sampleArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.chatContainer}>

          {loadingConv && !conversation ? (
            <View style={styles.centerFill}>
              <ActivityIndicator
                color={colors.accent}
                size="large"
              />
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(_, i) => String(i)}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.messageList}
              renderItem={({ item }) => (
                <Message m={item} />
              )}
              ListFooterComponent={
                pending ? <TypingBubble /> : null
              }
            />
          )}

          {/* Bottom composer */}
          <View style={styles.composerWrap}>
            <Composer
              value={draft}
              onChange={setDraft}
              onSend={handleSend}
              disabled={pending}
            />
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  )
}


/* =========================
   COMPOSER
========================= */

function Composer({
  value,
  onChange,
  onSend,
  disabled,
}) {
  const canSend = value.trim().length > 0 && !disabled

  return (
    <View style={styles.composer}>

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Describe a product, specification..."
        placeholderTextColor={colors.inkFaint}
        multiline
        textAlignVertical="top"
        editable={!disabled}
        returnKeyType="default"
        blurOnSubmit={false}
        style={styles.composerInput}
      />

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSend()}
        disabled={!canSend}
        style={[
          styles.sendButton,
          !canSend && styles.sendButtonDisabled,
        ]}
      >
        {disabled ? (
          <ActivityIndicator
            size="small"
            color={colors.onAccent}
          />
        ) : (
          <Text style={styles.sendButtonText}>
            ↑
          </Text>
        )}
      </TouchableOpacity>
    </View>
  )
}


/* =========================
   MESSAGE
========================= */

function Message({ m }) {
  if (m.role === 'user') {
    return (
      <View style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>
            {m.text}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.assistantRow}>

      <View style={styles.assistantIcon}>
        <Text style={styles.assistantIconText}>
          ✦
        </Text>
      </View>

      <View style={styles.assistantContent}>

        <Text style={styles.assistantLabel}>
          IPS Assistant
        </Text>

        <Text style={styles.assistantText}>
          {m.text}
        </Text>

        {m.results?.length > 0 && (
          <View style={styles.resultsCard}>
            {m.results.map((r, idx) => (
              <ResultRow
                key={r.id}
                r={r}
                last={
                  idx === m.results.length - 1
                }
              />
            ))}
          </View>
        )}
      </View>
    </View>
  )
}


/* =========================
   RESULT
========================= */

function ResultRow({ r, last }) {
  return (
    <View
      style={[
        styles.resultRow,
        !last && styles.resultRowBorder,
      ]}
    >
      <View style={styles.resultTop}>

        <View style={styles.resultInfo}>
          <View style={styles.resultIdRow}>
            <Text style={styles.resultId}>
              {r.id}
            </Text>

            <Text style={styles.resultVersion}>
              {r.version}
            </Text>
          </View>

          <Text style={styles.resultTitle}>
            {r.title}
          </Text>
        </View>

        <View style={styles.matchBadge}>
          <Text style={styles.matchBadgeText}>
            {r.match}%
          </Text>
        </View>

      </View>

      <Text style={styles.resultMeta}>
        ↗ {r.allied?.join(', ')}
      </Text>

      <Text style={styles.resultMeta}>
        🛡 {r.certification}
      </Text>
    </View>
  )
}


/* =========================
   TYPING
========================= */

function TypingBubble() {
  return (
    <View style={styles.assistantRow}>

      <View style={styles.assistantIcon}>
        <Text style={styles.assistantIconText}>
          ✦
        </Text>
      </View>

      <View style={styles.typingBubble}>
        <ActivityIndicator
          size="small"
          color={colors.inkFaint}
        />
      </View>

    </View>
  )
}


/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },

  chatContainer: {
    flex: 1,
  },

  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* EMPTY STATE */

  emptyScreen: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingBottom: 24,
  },

  heroLogo: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: colors.accent,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,

    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 4,
  },

  heroLogoText: {
    color: colors.onAccent,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  emptyTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 13.5,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
    marginBottom: 24,
  },

  /* COMPOSER */

  emptyComposerArea: {
    width: '100%',
  },

  composerWrap: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'android' ? 10 : 12,
    backgroundColor: colors.paper,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',

    backgroundColor: colors.panel,

    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,

    paddingLeft: 14,
    paddingRight: 7,
    paddingVertical: 7,

    minHeight: 58,

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  composerInput: {
    flex: 1,
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20,

    minHeight: 42,
    maxHeight: 110,

    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 2,
  },

  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 14,

    backgroundColor: colors.accent,

    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: 6,
  },

  sendButtonDisabled: {
    opacity: 0.35,
  },

  sendButtonText: {
    color: colors.onAccent,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 24,
  },

  /* SAMPLE */

  sampleButton: {
    flexDirection: 'row',
    alignItems: 'center',

    marginTop: 12,

    paddingHorizontal: 13,
    paddingVertical: 12,

    backgroundColor: colors.panel,

    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.line,
  },

  sampleIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,

    backgroundColor: colors.accentSoft,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  sampleIconText: {
    color: colors.accent2,
    fontSize: 14,
    fontWeight: '800',
  },

  sampleContent: {
    flex: 1,
  },

  sampleTitle: {
    color: colors.ink,
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 2,
  },

  sampleSubtitle: {
    color: colors.inkFaint,
    fontSize: 10.5,
  },

  sampleArrow: {
    color: colors.inkFaint,
    fontSize: 22,
    marginLeft: 6,
  },

  /* MESSAGES */

  messageList: {
    paddingHorizontal: 15,
    paddingTop: 18,
    paddingBottom: 14,
    gap: 15,
  },

  userRow: {
    alignItems: 'flex-end',
  },

  userBubble: {
    maxWidth: '84%',

    backgroundColor: colors.bubbleUser,

    borderRadius: 18,
    borderBottomRightRadius: 5,

    paddingHorizontal: 15,
    paddingVertical: 11,
  },

  userText: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20,
  },

  assistantRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },

  assistantIcon: {
    width: 30,
    height: 30,
    borderRadius: 11,

    backgroundColor: colors.accent,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 1,
  },

  assistantIconText: {
    color: colors.onAccent,
    fontSize: 12,
    fontWeight: '800',
  },

  assistantContent: {
    flex: 1,
    paddingRight: 5,
  },

  assistantLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.accent2,
    marginBottom: 3,
  },

  assistantText: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },

  typingBubble: {
    backgroundColor: colors.panel,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: colors.line,
  },

  /* RESULTS */

  resultsCard: {
    backgroundColor: colors.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },

  resultRow: {
    padding: 14,
  },

  resultRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },

  resultTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  resultInfo: {
    flex: 1,
    marginRight: 8,
  },

  resultIdRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },

  resultId: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
  },

  resultVersion: {
    fontSize: 11,
    color: colors.inkFaint,
  },

  resultTitle: {
    fontSize: 12.5,
    color: colors.inkSoft,
    marginTop: 3,
    lineHeight: 17,
  },

  matchBadge: {
    backgroundColor: colors.accentSoft,
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  logoImage: {
  width: 30,
  height: 30,
},

  matchBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accent2,
  },

  resultMeta: {
    fontSize: 11.5,
    color: colors.inkFaint,
    marginTop: 6,
    lineHeight: 16,
  },
})