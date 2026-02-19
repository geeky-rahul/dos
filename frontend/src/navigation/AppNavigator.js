import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import MainTabs from './MainTabs';
import ShopDetailScreen from '../screens/ShopDetailScreen';
import ShopDetailsScreen from '../screens/ShopDetailsScreen';
import OwnerDashboardScreen from '../screens/OwnerDashboardScreen';
import AddProductScreen from '../screens/AddProductScreen';
import ManageProductsScreen from '../screens/ManageProductsScreen';
import ShopSetupScreen from '../screens/ShopSetupScreen';

import auth from '@react-native-firebase/auth';
import { COLORS } from '../constants/colors';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [state, setstate] = useState({
    isLoading: true,
    isSignout: false,
    userToken: null,
    userRole: null,
  });

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Restore token from AsyncStorage
        const token = await AsyncStorage.getItem('userToken');
        const role = await AsyncStorage.getItem('userRole');
        setstate(prevState => ({
          ...prevState,
          isLoading: false,
          userToken: token,
          userRole: role,
        }));
      } catch (e) {
        console.error('Failed to restore token:', e);
        setstate(prevState => ({
          ...prevState,
          isLoading: false,
        }));
      }
    };

    bootstrapAsync();

    // Listen to Firebase auth changes
    const unsubscribe = auth().onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        // User logged out
        await AsyncStorage.multiRemove(['userToken', 'userId', 'userRole']);
        setstate({
          isLoading: false,
          isSignout: true,
          userToken: null,
          userRole: null,
        });
      }
    });

    return unsubscribe;
  }, []);

  if (state.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Register all screens statically and choose initial route based on auth state.
  // This prevents navigation actions (like `replace('MainTabs')`) from failing
  // when the target screen hasn't been conditionally registered yet.
  const initialRoute = state.userToken == null
    ? 'Login'
    : (state.userRole === 'owner' ? 'OwnerDashboard' : 'MainTabs');

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ShopSetup" component={ShopSetupScreen} />
      <Stack.Screen name="ShopDetails" component={ShopDetailsScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

      <Stack.Screen name="OwnerDashboard" component={OwnerDashboardScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
      <Stack.Screen name="ManageProducts" component={ManageProductsScreen} />

      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="ShopDetail" component={ShopDetailScreen} />
    </Stack.Navigator>
  );
}
