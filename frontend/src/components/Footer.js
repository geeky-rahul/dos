import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';

export default function Footer({ navigation, active }) {
  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.tabIcon}>🏠</Text>
        <Text style={active === 'Home' ? styles.tabTextActive : styles.tabText}>
          Home
        </Text>
      </TouchableOpacity>

      <View style={styles.tab}>
        <Text style={styles.tabIcon}>▶️</Text>
        <Text style={styles.tabText}>Play</Text>
      </View>

      <View style={styles.tab}>
        <Text style={styles.tabIcon}>%</Text>
        <Text style={styles.tabText}>Top Deals</Text>
      </View>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.tabIcon}>👤</Text>
        <Text
          style={active === 'Profile' ? styles.tabTextActive : styles.tabText}
        >
          Account
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 7,
    height: 65,
    width: '100%',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  tab: {
    alignItems: 'center',
  },

  tabIcon: {
    fontSize: 18,
  },

  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  tabTextActive: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
});
