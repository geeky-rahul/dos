import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import MainTabs from './MainTabs';
import ShopDetailScreen from '../screens/ShopDetailScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  // 🔐 FRONTEND DUMMY AUTH FLAG
  const isLoggedIn = false; // backend aane par auth state se replace hoga

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="ShopDetail" component={ShopDetailScreen} />
        </>
      )}

    </Stack.Navigator>
  );
}