import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '221034136281-lkpnrglt56qmoeiav9uqvaccg09r2bpo.apps.googleusercontent.com',
      offlineAccess: false,
    });
  }, []);

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
