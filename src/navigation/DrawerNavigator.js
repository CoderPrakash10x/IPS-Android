import React from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from '@react-navigation/drawer'
import { Ionicons } from '@expo/vector-icons'

import ConversationListScreen from '../screens/ConversationListScreen'
import { useAuth } from '../context/AuthContext'
import { colors } from '../theme/colors'

const Drawer = createDrawerNavigator()

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: 300,
          backgroundColor: colors.paper,
        },
      }}
    >
      <Drawer.Screen
        name="Conversations"
        component={ConversationListScreen}
      />
    </Drawer.Navigator>
  )
}

function CustomDrawer({ navigation }) {
  const { user, logout } = useAuth()

  const firstLetter =
    (user?.name || 'U').charAt(0).toUpperCase()

  return (
    <View style={styles.container}>

      <DrawerContentScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* BRAND */}
        <View style={styles.brand}>
          <View style={styles.logoBox}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.brandText}>
            <Text style={styles.brandTitle}>
              Indian Procurement
            </Text>

            <Text style={styles.brandSubtitle}>
              Standards Intelligence
            </Text>
          </View>
        </View>

        {/* NEW SEARCH */}
        <TouchableOpacity
          style={styles.newSearch}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('Conversations')
          }
        >
          <View style={styles.newSearchIcon}>
            <Ionicons
              name="add"
              size={20}
              color={colors.onAccent}
            />
          </View>

          <Text style={styles.newSearchText}>
            New search
          </Text>
        </TouchableOpacity>

        {/* NAVIGATION */}
        <Text style={styles.sectionLabel}>
          WORKSPACE
        </Text>

        <DrawerItem
          icon="chatbubbles-outline"
          title="Conversations"
          active
          onPress={() =>
            navigation.navigate('Conversations')
          }
        />

        <DrawerItem
          icon="time-outline"
          title="Search history"
          onPress={() =>
            navigation.navigate('Conversations')
          }
        />

        <Text style={styles.sectionLabel}>
          INFORMATION
        </Text>

        <DrawerItem
          icon="shield-checkmark-outline"
          title="Indian Standards"
        />

        <DrawerItem
          icon="information-circle-outline"
          title="About IPS"
        />

      </DrawerContentScrollView>

      {/* USER AREA */}
      <View style={styles.bottom}>

        <View style={styles.profile}>

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

        </View>

        <TouchableOpacity
          style={styles.logout}
          onPress={logout}
          activeOpacity={0.7}
        >
          <Ionicons
            name="log-out-outline"
            size={18}
            color={colors.inkSoft}
          />

          <Text style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  )
}

function DrawerItem({
  icon,
  title,
  active = false,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.drawerItem,
        active && styles.drawerItemActive,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Ionicons
        name={icon}
        size={19}
        color={
          active
            ? colors.accent
            : colors.inkSoft
        }
      />

      <Text
        style={[
          styles.drawerItemText,
          active && styles.drawerItemTextActive,
        ]}
      >
        {title}
      </Text>

      {active && (
        <View style={styles.activeDot} />
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },

  scroll: {
    paddingHorizontal: 15,
    paddingTop: 55,
    paddingBottom: 25,
  },

  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    paddingHorizontal: 5,
  },

  logoBox: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 34,
    height: 34,
  },

  brandText: {
    flex: 1,
    marginLeft: 11,
  },

  brandTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.ink,
  },

  brandSubtitle: {
    fontSize: 10.5,
    color: colors.inkFaint,
    marginTop: 2,
  },

  newSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 14,
    padding: 11,
    marginBottom: 27,
  },

  newSearchIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  newSearchText: {
    flex: 1,
    marginLeft: 10,
    color: colors.onAccent,
    fontSize: 13.5,
    fontWeight: '700',
  },

  sectionLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.inkFaint,
    marginLeft: 8,
    marginBottom: 8,
    marginTop: 4,
  },

  drawerItem: {
    minHeight: 46,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  drawerItemActive: {
    backgroundColor: colors.accentSoft,
  },

  drawerItemText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: colors.inkSoft,
    fontWeight: '500',
  },

  drawerItemTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },

  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },

  bottom: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    padding: 15,
    backgroundColor: colors.panel,
  },

  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '800',
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

  logout: {
    height: 40,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  logoutText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.inkSoft,
  },
})