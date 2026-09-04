import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { colors } from '../theme/colors'

const LOGO = require('../../assets/logo.png')

export default function LoginScreen() {
  const { login, signup } = useAuth()

  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (
      !email.trim() ||
      !password.trim() ||
      (mode === 'signup' && !name.trim())
    ) {
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
      Alert.alert(
        'Error',
        err?.message || 'Something went wrong'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'android' ? 20 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* BRANDING */}
        <View style={styles.brand}>
          <View style={styles.logoContainer}>
            <Image
              source={LOGO}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.brandName}>
            Indian Procurement System
          </Text>

          <Text style={styles.brandTagline}>
            Intelligent standards discovery for procurement
          </Text>
        </View>

        {/* CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>
              {mode === 'login'
                ? 'Welcome back'
                : 'Create your account'}
            </Text>

            <Text style={styles.subtitle}>
              {mode === 'login'
                ? 'Sign in to continue your procurement workspace.'
                : 'Create an account to start discovering applicable Indian Standards.'}
            </Text>
          </View>

          {mode === 'signup' && (
            <Field
              label="Full name"
              value={name}
              onChange={setName}
              placeholder="Prakash Dubey"
              autoCapitalize="words"
            />
          )}

          <Field
            label="Email address"
            value={email}
            onChange={setEmail}
            placeholder="you@department.gov.in"
            keyboardType="email-address"
          />

          <Field
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            secure
          />

          {/* PRIMARY BUTTON */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.button,
              submitting && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator
                color={colors.onAccent}
              />
            ) : (
              <Text style={styles.buttonText}>
                {mode === 'login'
                  ? 'Sign in'
                  : 'Create account'}
              </Text>
            )}
          </TouchableOpacity>

          {/* SWITCH MODE */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              setMode(
                mode === 'login'
                  ? 'signup'
                  : 'login'
              )
            }
            style={styles.switchButton}
          >
            <Text style={styles.switchText}>
              {mode === 'login'
                ? "Don't have an account? "
                : 'Already have an account? '}

              <Text style={styles.switchLink}>
                {mode === 'login'
                  ? 'Create one'
                  : 'Sign in'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.footerDot} />

          <Text style={styles.footerText}>
            Powered by Indian Standards intelligence
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  secure,
  keyboardType,
  autoCapitalize = 'none',
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        selectionColor={colors.accent}
        style={styles.input}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 36,
  },

  /* BRAND */

  brand: {
    alignItems: 'center',
    marginBottom: 26,
  },

  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,

    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 6,
  },

  logo: {
    width: 54,
    height: 54,
  },

  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.3,
    textAlign: 'center',
  },

  brandTagline: {
    fontSize: 12,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 17,
  },

  /* CARD */

  card: {
    backgroundColor: colors.panel,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 22,

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 3,
  },

  cardHeader: {
    marginBottom: 22,
  },

  title: {
    fontSize: 23,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.5,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 13,
    color: colors.inkSoft,
    lineHeight: 19,
  },

  /* INPUTS */

  field: {
    marginBottom: 15,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkSoft,
    marginBottom: 7,
  },

  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,

    paddingHorizontal: 15,
    paddingVertical: 12,

    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.surface,
  },

  /* BUTTON */

  button: {
    minHeight: 51,
    backgroundColor: colors.accent,
    borderRadius: 14,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 5,

    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    color: colors.onAccent,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.1,
  },

  /* SWITCH */

  switchButton: {
    marginTop: 19,
    paddingVertical: 4,
  },

  switchText: {
    textAlign: 'center',
    fontSize: 12.5,
    color: colors.inkSoft,
  },

  switchLink: {
    color: colors.accent,
    fontWeight: '800',
  },

  /* FOOTER */

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    gap: 7,
  },

  footerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },

  footerText: {
    fontSize: 10.5,
    color: colors.inkFaint,
  },
})