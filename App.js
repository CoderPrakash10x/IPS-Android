import 'react-native-gesture-handler'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ActivityIndicator, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'

import { AuthProvider, useAuth } from './src/context/AuthContext'
import { HistoryProvider } from './src/context/HistoryContext'
import LoginScreen from './src/screens/LoginScreen'
import ConversationListScreen from './src/screens/ConversationListScreen'
import ChatScreen from './src/screens/ChatScreen'
import { colors } from './src/theme/colors'

const Stack = createNativeStackNavigator()

function AppNavigator() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    )
  }

  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: colors.paper },
      headerTintColor: colors.ink,
      headerShadowVisible: false,
    }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Conversations" component={ConversationListScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Chat" component={ChatScreen} options={{ title: '' }} />
        </>
      )}
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HistoryProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <AppNavigator />
        </NavigationContainer>
      </HistoryProvider>
    </AuthProvider>
  )
}
