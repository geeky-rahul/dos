import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PlayScreen from '../screens/PlayScreen';
import DealsScreen from '../screens/DealsScreen';
import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();

const TabIcon = ({ icon, focused }) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 18 }}>{icon}</Text>
    {focused && (
      <View
        style={{
          width: 20,
          height: 2,
          backgroundColor: COLORS.primary,
          marginTop: 4,
          borderRadius: 2,
        }}
      />
    )}
  </View>
);

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarStyle: {
          height: 65,
          borderTopColor: '#ddd',
        },

        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },

        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#888',

        tabBarIcon: ({ focused }) => {
          let icon = '⬤';
          if (route.name === 'Home') icon = '🏠';
          if (route.name === 'Play') icon = '▶️';
          if (route.name === 'Deals') icon = '%';
          if (route.name === 'Account') icon = '👤';

          return <TabIcon icon={icon} focused={focused} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Play" component={PlayScreen} />
      <Tab.Screen name="Deals" component={DealsScreen} />
      <Tab.Screen name="Account" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
