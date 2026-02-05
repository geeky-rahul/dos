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
import { COLORS } from '../constants/colors';
import auth from '@react-native-firebase/auth';

export default function AccountScreen({ navigation }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const menuItems = [
    {
      section: 'Account',
      items: [
        { icon: '👤', label: 'Edit Profile', action: 'editProfile' },
        { icon: '📍', label: 'Saved Addresses', action: 'addresses' },
        { icon: '❤️', label: 'Favorite Shops', action: 'favorites', badge: '12' },
      ],
    },
    {
      section: 'Preferences',
      items: [
        {
          icon: '🔔',
          label: 'Notifications',
          toggle: true,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          icon: '🌙',
          label: 'Dark Mode',
          toggle: true,
          value: darkModeEnabled,
          onToggle: setDarkModeEnabled,
        },
        { icon: '🌐', label: 'Language', action: 'language', subtitle: 'English' },
      ],
    },
    {
      section: 'Support',
      items: [
        { icon: '❓', label: 'Help & Support', action: 'help' },
        { icon: '⭐', label: 'Rate Us', action: 'rate' },
        { icon: '📧', label: 'Feedback', action: 'feedback' },
        { icon: 'ℹ️', label: 'About', action: 'about', subtitle: 'Version 1.0.0' },
      ],
    },
  ];

  const handleMenuPress = (action) => {
    console.log('Menu action:', action);
  };

  // ✅ LOGOUT HANDLER
  const handleLogout = async () => {
  try {
    await auth().signOut();
    // ❌ navigation.reset REMOVE
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
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Account</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>👤</Text>
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
            <Text style={styles.editIcon}>✏️</Text>
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
                      <View style={styles.menuIcon}>
                        <Text style={styles.menuIconText}>{item.icon}</Text>
                      </View>

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
                        trackColor={{ false: '#D1D5DB', true: COLORS.primary }}
                        thumbColor="#FFF"
                      />
                    ) : (
                      <Text style={styles.menuArrow}>›</Text>
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
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ for Local Shops</Text>
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  backButton: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backIcon: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: '600',
    justifyContent: 'center',
    alignItems: 'center',
    
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },

  placeholder: {
    width: 40,
  },

  /* PROFILE CARD */
  profileCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },

  userEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },

  userPhone: {
    fontSize: 13,
    color: '#666',
  },

  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
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
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },

  /* MENU SECTIONS */
  menuSection: {
    marginTop: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginHorizontal: 16,
    marginBottom: 10,
  },

  menuCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#1A1A1A',
  },

  badge: {
    backgroundColor: '#FF6B6B',
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
    color: '#999',
    marginTop: 2,
  },

  menuArrow: {
    fontSize: 24,
    color: '#CCC',
    fontWeight: '300',
  },

  menuDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 66,
  },

  /* LOGOUT */
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FF6B6B',
  },

  logoutIcon: {
    fontSize: 20,
    marginRight: 8,
  },

  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B6B',
  },

  /* FOOTER */
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },

  footerText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },

  footerVersion: {
    fontSize: 11,
    color: '#CCC',
  },
});