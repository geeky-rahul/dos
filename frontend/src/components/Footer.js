import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants/colors';

export default function Footer({ navigation, active }) {
  const tabs = [
    { name: 'Home', icon: 'home', route: 'Home' },
    { name: 'Play', icon: 'play-circle', route: 'Play' },
    { name: 'Deals', icon: 'pricetag', route: 'Deals' },
    { name: 'Profile', icon: 'person', route: 'Profile' },
  ];

  return (
    <View style={styles.footer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={styles.tab}
          onPress={() => navigation.navigate(tab.route)}
          activeOpacity={0.7}
        >
          <Icon
            name={active === tab.name ? tab.icon : `${tab.icon}-outline`}
            size={26}
            color={active === tab.name ? COLORS.primary : COLORS.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              active === tab.name && styles.tabTextActive,
            ]}
          >
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    height: 72,
    width: '100%',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderColor: COLORS.divider,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginTop: 4,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
