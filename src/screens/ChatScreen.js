import { useEffect, useRef, useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native'
import { useHistory } from '../context/HistoryContext'
import { colors } from '../theme/colors'

const SAMPLE_QUERY =
  'Supply and installation of hot-rolled structural steel sections for a warehouse frame, load-bearing, weather-exposed, IS-compliant grade required.'

export default function ChatScreen({ route, navigation }) {
  const initialId = route.params?.conversationId || null
  const [conversationId, setConversationId] = useState(initialId)
  const { conversations, loadConversation, createConversation, sendMessage } = useHistory()
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)
  const [loadingConv, setLoadingConv] = useState(false)
  const listRef = useRef(null)

  const conversation = conversationId ? conversations[conversationId] : null
  const messages = conversation?.messages || []

  useEffect(() => {
    navigation.setOptions({ title: conversation?.title || 'New search' })
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
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }, [messages.length, pending])

  const handleSend = async (text) => {
    const value = text ?? draft
    if (!value.trim()) return
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
      Alert.alert('Error', err.message || 'Something went wrong')
    } finally {
      setPending(false)
    }
  }

  const isEmpty = !conversationId

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {isEmpty ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}><Text style={styles.emptyIconText}>IPS</Text></View>
          <Text style={styles.emptyTitle}>What are you procuring today?</Text>
          <Text style={styles.emptySubtitle}>
            Describe the product or service. I'll recommend applicable Indian Standards,
            with allied references and certification needs.
          </Text>

          <Composer value={draft} onChange={setDraft} onSend={handleSend} disabled={pending} />

          <TouchableOpacity onPress={() => handleSend(SAMPLE_QUERY)} style={{ marginTop: 14 }}>
            <Text style={styles.sampleLink}>✦ Try a sample specification</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {loadingConv && !conversation ? (
            <View style={styles.centerFill}><ActivityIndicator color={colors.accent} /></View>
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(_, i) => String(i)}
              contentContainerStyle={{ padding: 16, gap: 14 }}
              renderItem={({ item }) => <Message m={item} />}
              ListFooterComponent={pending ? <TypingBubble /> : null}
            />
          )}
          <View style={styles.composerWrap}>
            <Composer value={draft} onChange={setDraft} onSend={handleSend} disabled={pending} />
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  )
}

function Composer({ value, onChange, onSend, disabled }) {
  return (
    <View style={styles.composer}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Describe a product, spec, or ask a follow-up…"
        placeholderTextColor={colors.inkFaint}
        multiline
        style={styles.composerInput}
        editable={!disabled}
      />
      <TouchableOpacity
        onPress={() => onSend()}
        disabled={!value.trim() || disabled}
        style={[styles.sendButton, (!value.trim() || disabled) && { opacity: 0.4 }]}
      >
        <Text style={styles.sendButtonText}>➤</Text>
      </TouchableOpacity>
    </View>
  )
}

function Message({ m }) {
  if (m.role === 'user') {
    return (
      <View style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{m.text}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.assistantRow}>
      <View style={styles.assistantIcon}><Text style={styles.assistantIconText}>✦</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.assistantText}>{m.text}</Text>
        {m.results?.length > 0 && (
          <View style={styles.resultsCard}>
            {m.results.map((r, idx) => (
              <ResultRow key={r.id} r={r} last={idx === m.results.length - 1} />
            ))}
          </View>
        )}
      </View>
    </View>
  )
}

function ResultRow({ r, last }) {
  return (
    <View style={[styles.resultRow, !last && styles.resultRowBorder]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 6 }}>
            <Text style={styles.resultId}>{r.id}</Text>
            <Text style={styles.resultVersion}>{r.version}</Text>
          </View>
          <Text style={styles.resultTitle}>{r.title}</Text>
        </View>
        <View style={styles.matchBadge}>
          <Text style={styles.matchBadgeText}>{r.match}%</Text>
        </View>
      </View>
      <Text style={styles.resultMeta}>↗ {r.allied?.join(', ')}</Text>
      <Text style={styles.resultMeta}>🛡 {r.certification}</Text>
    </View>
  )
}

function TypingBubble() {
  return (
    <View style={styles.assistantRow}>
      <View style={styles.assistantIcon}><Text style={styles.assistantIconText}>✦</Text></View>
      <View style={styles.typingBubble}>
        <ActivityIndicator size="small" color={colors.inkFaint} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  emptyIcon: {
    width: 44, height: 44, borderRadius: 16, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center', marginBottom: 18,
  },
  emptyIconText: { color: colors.onAccent, fontWeight: '700', fontSize: 12 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: colors.ink, textAlign: 'center', marginBottom: 8 },
  emptySubtitle: { fontSize: 13.5, color: colors.inkSoft, textAlign: 'center', marginBottom: 24, lineHeight: 19 },
  sampleLink: { fontSize: 13, color: colors.accent2, fontWeight: '600' },

  composerWrap: { padding: 12, borderTopWidth: 1, borderTopColor: colors.line },
  composer: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    backgroundColor: colors.panel, borderRadius: 16, borderWidth: 1, borderColor: colors.line,
    padding: 8,
  },
  composerInput: {
    flex: 1, fontSize: 14, color: colors.ink, maxHeight: 100, paddingVertical: 6, paddingHorizontal: 6,
  },
  sendButton: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  sendButtonText: { color: colors.onAccent, fontSize: 14, fontWeight: '700' },

  userRow: { alignItems: 'flex-end' },
  userBubble: {
    maxWidth: '82%', backgroundColor: colors.bubbleUser, borderRadius: 16,
    borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10,
  },
  userText: { fontSize: 14, color: colors.ink, lineHeight: 20 },

  assistantRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  assistantIcon: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  assistantIconText: { fontSize: 11, color: colors.onAccent },
  assistantText: { fontSize: 14, color: colors.ink, lineHeight: 20, marginBottom: 8 },
  typingBubble: {
    backgroundColor: colors.panel, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10,
  },

  resultsCard: {
    borderWidth: 1, borderColor: colors.line, borderRadius: 16,
    backgroundColor: colors.panel, overflow: 'hidden',
  },
  resultRow: { padding: 14 },
  resultRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
  resultId: { fontSize: 14, fontWeight: '700', color: colors.ink },
  resultVersion: { fontSize: 11, color: colors.inkFaint },
  resultTitle: { fontSize: 12.5, color: colors.inkSoft, marginTop: 2 },
  matchBadge: { backgroundColor: colors.accentSoft, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  matchBadgeText: { fontSize: 11, fontWeight: '700', color: colors.accent2 },
  resultMeta: { fontSize: 11.5, color: colors.inkFaint, marginTop: 6 },
})
