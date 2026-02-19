import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';

import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants/colors';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AccountScreen({ navigation }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const menuItems = [
    {
      section: 'Account',
      items: [
        { icon: 'person', label: 'Edit Profile', action: 'editProfile' },
        { icon: 'location', label: 'Saved Addresses', action: 'addresses' },
        { icon: 'heart', label: 'Favorite Shops', action: 'favorites', badge: '12' },
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
        { icon: 'star', label: 'Rate Us', action: 'rate' },
        { icon: 'mail', label: 'Feedback', action: 'feedback' },
        { icon: 'information-circle', label: 'About', action: 'about', subtitle: 'Version 1.0.0' },
      ],
    },
  ];

  const handleMenuPress = (action) => {
    console.log('Menu action:', action);
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
          <View style={styles.avatarContainer}>
            <Icon name="person" size={40} color={COLORS.primary} />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>Rahul Gupta</Text>
            <Text style={styles.userEmail}>rahul@example.com</Text>
            <Text style={styles.userPhone}>+91 98765 43210</Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleMenuPress('editProfile')}
          >
            <Icon name="pencil" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* STATS */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Shops Visited</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>156</Text>
            <Text style={styles.statLabel}>Products Viewed</Text>
          </View>
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

  /* STATS */
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
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