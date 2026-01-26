import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';

export default function ProfileScreen() {

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.name}>Rahul</Text>
        <Text style={styles.sub}>rahul@example.com</Text>
      </View>

      {/* OPTIONS */}
      <View style={styles.card}>
        <ProfileItem title="Saved Addresses" />
        <ProfileItem title="Help & Support" />
        <ProfileItem title="About App" />
        <ProfileItem title="Privacy Policy" />
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const ProfileItem = ({ title }) => (
  <TouchableOpacity style={styles.item}>
    <Text style={styles.itemText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  name: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },

  sub: {
    color: '#ffe0c7',
    fontSize: 13,
    marginTop: 4,
  },

  card: {
    margin: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingVertical: 4,
  },

  item: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
  },

  itemText: {
    fontSize: 15,
  },

  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#ffecec',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  logoutText: {
    color: 'red',
    fontWeight: '600',
  },
});
