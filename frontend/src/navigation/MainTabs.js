import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PlayScreen from '../screens/PlayScreen';
import DealsScreen from '../screens/DealsScreen';
import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();

const TabIcon = ({ name, focused }) => (
  <View style={{ alignItems: 'center' }}>
    <Icon name={focused ? name : `${name}-outline`} size={22} color={focused ? COLORS.primary : COLORS.textMuted} />
  </View>
);

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 68,
          borderTopColor: '#E6EEF9',
          backgroundColor: COLORS.surface,
          paddingBottom: 8,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
        },

        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,

        tabBarIcon: ({ focused }) => {
          if (route.name === 'Home') return <TabIcon name="home" focused={focused} />;
          if (route.name === 'Play') return <TabIcon name="play-circle" focused={focused} />;
          if (route.name === 'Deals') return <TabIcon name="pricetag" focused={focused} />;
          if (route.name === 'Account') return <TabIcon name="person" focused={focused} />;
          return null;
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
