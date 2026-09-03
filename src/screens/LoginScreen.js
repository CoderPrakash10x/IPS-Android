import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { colors } from '../theme/colors'

export default function LoginScreen() {
  const { login, signup } = useAuth()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim() || (mode === 'signup' && !name.trim())) {
      Alert.alert('Missing info', 'Please fill in all fields.')
      return
    }
    setSubmitting(true)
    try {
      if (mode === 'signup') {
        await signup({ name, email, password })
        setMode('login')
        setPassword('')
        Alert.alert('Account created', 'Please sign in below.')
      } else {
        await login({ email, password })
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.logoRow}>
        <View style={styles.logoChip}>
          <Text style={styles.logoChipText}>IPS</Text>
        </View>
        <Text style={styles.logoText}>IPS</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{mode === 'login' ? 'Sign in' : 'Create account'}</Text>
        <Text style={styles.subtitle}>Access the standards recommendation workspace.</Text>

        {mode === 'signup' && (
          <Field label="Name" value={name} onChange={setName} placeholder="Prakash Dubey" />
        )}
        <Field label="Email" value={email} onChange={setEmail} placeholder="you@department.gov.in" keyboardType="email-address" />
        <Field label="Password" value={password} onChange={setPassword} placeholder="••••••••" secure />

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color={colors.onAccent} />
          ) : (
            <Text style={styles.buttonText}>{mode === 'login' ? 'Sign in' : 'Create account'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{ marginTop: 18 }}>
          <Text style={styles.switchText}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Text style={styles.switchLink}>{mode === 'login' ? 'Create one' : 'Sign in'}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

function Field({ label, value, onChange, placeholder, secure, keyboardType }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize="none"
        style={styles.input}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper, justifyContent: 'center', paddingHorizontal: 24 },
  logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 28 },
  logoChip: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  logoChipText: { color: colors.paper, fontWeight: '700', fontSize: 13 },
  logoText: { fontSize: 20, fontWeight: '700', color: colors.ink },
  card: { backgroundColor: colors.panel, borderRadius: 18, borderWidth: 1, borderColor: colors.line, padding: 22 },
  title: { fontSize: 20, fontWeight: '700', color: colors.ink, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.inkSoft, marginBottom: 20 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: colors.inkSoft, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: colors.line, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 14,
    color: colors.ink, backgroundColor: colors.surface,
  },
  button: {
    backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 13,
    alignItems: 'center', marginTop: 6,
  },
  buttonText: { color: colors.onAccent, fontWeight: '700', fontSize: 14 },
  switchText: { textAlign: 'center', fontSize: 12.5, color: colors.inkSoft },
  switchLink: { color: colors.accent, fontWeight: '700' },
})
