import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import auth from '@react-native-firebase/auth';
import { getUserDoc } from '../services/firebase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { COLORS } from '../constants/colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  /* ================= VALIDATION ================= */
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /* ================= EMAIL LOGIN ================= */
  const handleLogin = async () => {
    let hasError = false;

    if (!email.trim()) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (hasError) return;

    try {
      setLoading(true);
      
      // Firebase login
      const userCredential = await auth().signInWithEmailAndPassword(
        email.trim(),
        password
      );

      // Get Firebase token
      const token = await userCredential.user.getIdToken();
      const userId = userCredential.user.uid;

      // Fetch user role and shopProfileComplete from Firestore users/shops
      let userRole = 'user';
      let shopProfileComplete = false;
      try {
        const userDoc = await getUserDoc(userId);
        if (userDoc) {
          userRole = userDoc.role || 'user';
        }

        // Check if shop doc exists for owner
        if (userRole === 'owner') {
          // lazy check of shops collection presence
          // We'll rely on ShopDetails flow to set shopProfileComplete when owner fills shop
          // For now, assume false and let other flows handle redirect
          shopProfileComplete = false;
        }
        console.log('✅ User data fetched:', { userRole, shopProfileComplete });
      } catch (err) {
        console.warn('Error fetching user doc:', err.message);
      }

      // Store in AsyncStorage
      await AsyncStorage.multiSet([
        ['userToken', token],
        ['userId', userId],
        ['userRole', userRole],
        ['shopProfileComplete', shopProfileComplete ? 'true' : 'false'],
      ]);

      console.log('✅ Login success:', { userRole, userId, shopProfileComplete });

      // Navigate based on role and shop setup state
      if (userRole === 'owner') {
        if (shopProfileComplete) {
          navigation.replace('OwnerDashboard');
        } else {
          navigation.replace('ShopSetup');
        }
      } else {
        navigation.replace('MainTabs');
      }
    } catch (error) {
      let errorMsg = 'Login failed';
      if (error.code === 'auth/user-not-found') {
        errorMsg = 'No account found with this email';
        setEmailError(errorMsg);
      } else if (error.code === 'auth/wrong-password') {
        errorMsg = 'Incorrect password';
        setPasswordError(errorMsg);
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address';
        setEmailError(errorMsg);
      } else {
        Alert.alert('Login Failed', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= GOOGLE LOGIN ================= */
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo?.idToken;

      if (!idToken) {
        Alert.alert('Error', 'No idToken received from Google');
        return;
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);

      // Get Firebase token
      const token = await userCredential.user.getIdToken();
      const userId = userCredential.user.uid;

      // Fetch user role from Firestore
      let userRole = 'user'; // Default fallback
      let shopProfileComplete = false;
      try {
        const userDoc = await getUserDoc(userId);
        if (userDoc) {
          userRole = userDoc.role || 'user';
        }
        console.log('✅ User data fetched (google):', { userRole });
      } catch (fetchError) {
        console.warn('Error fetching user doc:', fetchError.message);
      }

      // Store in AsyncStorage
      await AsyncStorage.multiSet([
        ['userToken', token],
        ['userId', userId],
        ['userRole', userRole],
        ['shopProfileComplete', shopProfileComplete ? 'true' : 'false'],
      ]);

      console.log('✅ Google login success:', { userRole, userId, shopProfileComplete });

      // Navigate based on role and shop setup state
      if (userRole === 'owner') {
        if (shopProfileComplete) {
          navigation.replace('OwnerDashboard');
        } else {
          navigation.replace('ShopSetup');
        }
      } else {
        navigation.replace('MainTabs');
      }
    } catch (error) {
      if (error.code !== 'CANCELED') {
        Alert.alert('Google login failed', error.message || 'Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Gradient Background */}
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBg}
          />

          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Icon name="bag-check" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to your account</Text>
            </View>

            {/* Email */}
            <View>
              <View style={[styles.inputContainer, emailError && styles.inputError]}>
                <Icon name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError('');
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>
              {emailError && <Text style={styles.errorText}>{emailError}</Text>}
            </View>

            {/* Password */}
            <View>
              <View style={[styles.inputContainer, passwordError && styles.inputError]}>
                <Icon name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError('');
                  }}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={loading}>
                  <Icon
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
            </View>

            {/* Forgot */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginButton}
            >
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                style={styles.loginButtonInner}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </LinearGradient>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Button */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              <Icon name="logo-google" size={20} color={COLORS.primary} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Signup Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                disabled={loading}
              >
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardView: { flex: 1 },
  gradientBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  scrollView: { flexGrow: 1, justifyContent: 'center', paddingVertical: 20 },
  content: { padding: 24, marginTop: 40 },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: { marginBottom: 32 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: { fontSize: 15, color: '#666666' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#1A1A1A',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 10,
    marginLeft: 4,
  },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 20, marginTop: 8 },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    marginTop: 8,
  },
  loginButtonInner: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E5E5' },
  dividerText: { marginHorizontal: 16, color: '#666666', fontSize: 14 },
  googleButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  signupContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  signupText: { color: '#666666', fontSize: 14 },
  signupLink: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
});
