import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants/colors';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncUserWithBackend } from '../services/authService';
import { CommonActions } from '@react-navigation/native';

export default function AccountScreen({ navigation }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [userData, setUserData] = useState({
    name: 'Loading...',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      // Try to get data from backend first
      const backendData = await syncUserWithBackend();
      if (backendData) {
        setUserData({
          name: backendData.name || 'User',
          email: backendData.email || '',
          phone: backendData.phone || '',
        });
        return;
      }

      // Try cached data as a fallback
      const cachedData = await AsyncStorage.getItem('userData');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        setUserData({
          name: parsed.name || 'User',
          email: parsed.email || '',
          phone: parsed.phone || '',
        });
        return;
      }

      // Fallback to Firebase auth data
      const user = auth().currentUser;
      if (user) {
        setUserData({
          name: user.displayName || 'User',
          email: user.email || '',
          phone: '',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      const user = auth().currentUser;
      if (user) {
        setUserData({
          name: user.displayName || 'User',
          email: user.email || '',
          phone: '',
        });
      }
    }
  };

  const menuItems = [
    {
      section: 'Account',
      items: [
        { icon: 'heart', label: 'Favorite Shops', action: 'favorites', badge: '5' },
        { icon: 'search', label: 'Recent Searches', action: 'searches' },
      ],
    },
    {
      section: 'Preferences',
      items: [
        {
          icon: 'notifications',
          label: 'Notifications',
          toggle: true,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          icon: 'moon',
          label: 'Dark Mode',
          toggle: true,
          value: darkModeEnabled,
          onToggle: setDarkModeEnabled,
        },
        { icon: 'globe', label: 'Language', action: 'language', subtitle: 'English' },
      ],
    },
    {
      section: 'Support',
      items: [
        { icon: 'help-circle', label: 'Help & Support', action: 'help' },
        { icon: 'information-circle', label: 'About', action: 'about', subtitle: 'Version 1.0.0' },
      ],
    },
  ];

  const handleMenuPress = (action) => {
    switch (action) {
      case 'editProfile':
        navigation.navigate('EditProfile');
        break;
      case 'favorites':
        // TODO: Navigate to favorites screen
        break;
      case 'searches':
        // TODO: Navigate to recent searches screen
        break;
      case 'language':
        // TODO: Navigate to language screen
        break;
      case 'help':
        // TODO: Navigate to help screen
        break;
      case 'rate':
        // TODO: Navigate to rate app
        break;
      case 'feedback':
        // TODO: Navigate to feedback screen
        break;
      case 'about':
        // TODO: Navigate to about screen
        break;
      default:
        console.log('Menu action:', action);
    }
  };

  // ✅ LOGOUT HANDLER
  const handleLogout = async () => {
    try {
      // Clear local auth data and sign out
      await AsyncStorage.multiRemove(['userToken', 'userId', 'userRole', 'shopProfileComplete']);
      await auth().signOut();

      // Reset navigation to Login (clears history)
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (e) {
      console.log(e);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Icon name="chevron-back" size={28} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Account</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
            <Text style={styles.userPhone}>{userData.phone}</Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleMenuPress('editProfile')}
          >
            <Icon name="pencil" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* MENU */}
        {menuItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.section}</Text>

            <View style={styles.menuCard}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => !item.toggle && handleMenuPress(item.action)}
                    activeOpacity={item.toggle ? 1 : 0.7}
                  >
                    <View style={styles.menuLeft}>
                      <Icon
                        name={item.icon}
                        size={22}
                        color={COLORS.primary}
                        style={styles.menuIconObj}
                      />

                      <View style={styles.menuTextContainer}>
                        <View style={styles.menuLabelRow}>
                          <Text style={styles.menuLabel}>{item.label}</Text>
                          {item.badge && (
                            <View style={styles.badge}>
                              <Text style={styles.badgeText}>{item.badge}</Text>
                            </View>
                          )}
                        </View>
                        {item.subtitle && (
                          <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                        )}
                      </View>
                    </View>

                    {item.toggle ? (
                      <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        trackColor={{ false: COLORS.border, true: COLORS.primary }}
                        thumbColor="#FFF"
                      />
                    ) : (
                      <Icon name="chevron-forward" size={20} color={COLORS.textMuted} />
                    )}
                  </TouchableOpacity>

                  {itemIndex < section.items.length - 1 && (
                    <View style={styles.menuDivider} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* LOGOUT */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Icon name="log-out" size={20} color="#FFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.footerText}>Made with </Text>
            <Icon name="heart" size={14} color={COLORS.accent} style={{ marginHorizontal: 6 }} />
            <Text style={styles.footerText}>for Local Shops</Text>
          </View>
          <Text style={styles.footerVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  /* HEADER */
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },

  backButton: {
    padding: 8,
  },

  backIcon: {
    fontSize: 24,
    color: COLORS.text,
    fontWeight: '600',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },

  placeholder: {
    width: 40,
  },

  /* PROFILE CARD */
  profileCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  avatarText: {
    fontSize: 36,
  },

  profileInfo: {
    flex: 1,
  },

  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },

  userEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },

  userPhone: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  editButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  editIcon: {
    fontSize: 18,
  },

  /* MENU SECTIONS */
  menuSection: {
    marginTop: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginHorizontal: 16,
    marginBottom: 10,
  },

  menuCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },

  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  menuIconObj: {
    marginRight: 12,
  },

  menuIconText: {
    fontSize: 20,
  },

  menuTextContainer: {
    flex: 1,
  },

  menuLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },

  badge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },

  menuSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  menuArrow: {
    fontSize: 24,
    color: COLORS.divider,
    fontWeight: '300',
  },

  menuDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 66,
  },

  /* LOGOUT */
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  logoutIcon: {
    fontSize: 20,
    marginRight: 8,
  },

  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },

  /* FOOTER */
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },

  footerText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 4,
  },

  footerVersion: {
    fontSize: 11,
    color: '#CCC',
  },
});