import React, { useState } from 'react';
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
import { auth, createUserDoc } from '../services/firebase';
import { COLORS } from '../constants/colors';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [role, setRole] = useState('user'); // 'user' or 'owner'
  
  // Shop owner specific fields
  // removed shop-specific fields from register screen; owners complete on ShopSetup

  /* ================= VALIDATION ================= */
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleRegister = async () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // shop owner will complete shop details in ShopSetup screen

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
        console.log('Register: starting', { email: email.trim(), role });

      const userCredential = await auth().createUserWithEmailAndPassword(
        email.trim(),
        password
      );
        console.log('Register: created userCredential', userCredential && userCredential.user && userCredential.user.uid);

      // Save name in Firebase profile
      await userCredential.user.updateProfile({ displayName: name.trim() });

      const userId = userCredential.user.uid;

      // Create user doc in Firestore with role, but don't let this hang indefinitely
      console.log('Register: creating user doc', { userId });
      const createDocPromise = createUserDoc(userId, email.trim(), role === 'owner' ? 'owner' : 'user');
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('createUserDoc timeout')), 10000),
      );
      try {
        await Promise.race([createDocPromise, timeout]);
        console.log('Register: user doc created');
      } catch (e) {
        console.warn('Register: createUserDoc failed or timed out, continuing', e.message);
      }

      // Store minimal session info locally
      const token = await userCredential.user.getIdToken();
      await AsyncStorage.multiSet([
        ['userToken', token],
        ['userId', userId],
        ['userRole', role === 'owner' ? 'owner' : 'user'],
      ]);

      Alert.alert('Success', `Account created successfully!`, [
        {
          text: 'OK',
          onPress: () => {
              if (role === 'owner') {
                // Owner: go to ShopSetup to complete shop profile
                navigation.replace('ShopSetup', { uid: userId });
              } else {
              navigation.replace('MainTabs');
            }
          },
        },
      ]);
    } catch (error) {
      console.error('Register: error', error);
      let errorMsg = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMsg = 'This email is already registered';
        newErrors.email = errorMsg;
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address';
        newErrors.email = errorMsg;
      }
      setErrors(newErrors);
      Alert.alert('Registration Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    Alert.alert('Coming Soon', 'Google signup will be available soon');
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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join DOS marketplace today</Text>
            </View>

            {/* Name Input */}
            <View>
              <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                <Icon name="person-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  editable={!loading}
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Email Input */}
            <View>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Icon name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password Input */}
            <View>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Icon name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="Password (min 8 characters)"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: '' });
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
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Confirm Password Input */}
            <View>
              <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                <Icon name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                  }}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading}>
                  <Icon
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            {/* Role Selection */}
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>I am registering as:</Text>
              <View style={styles.roleButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === 'user' && styles.roleButtonActive,
                  ]}
                  onPress={() => {
                    setRole('user');
                    setErrors({});
                  }}
                  disabled={loading}
                >
                  <Icon
                    name="person"
                    size={20}
                    color={role === 'user' ? '#FFF' : COLORS.primary}
                  />
                  <Text
                    style={[
                      styles.roleButtonText,
                      role === 'user' && styles.roleButtonTextActive,
                    ]}
                  >
                    Regular User
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                      styles.roleButton,
                      role === 'owner' && styles.roleButtonActive,
                    ]}
                    onPress={() => {
                      setRole('owner');
                      setErrors({});
                    }}
                  disabled={loading}
                >
                  <Icon
                      name="storefront"
                      size={20}
                      color={role === 'owner' ? '#FFF' : COLORS.primary}
                  />
                  <Text
                    style={[
                      styles.roleButtonText,
                        role === 'owner' && styles.roleButtonTextActive,
                    ]}
                  >
                    Shop Owner
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Shop owner will complete shop details in ShopSetup screen after registration */}

            {/* Register Button */}
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.registerButton}
            >
              <TouchableOpacity
                onPress={handleRegister}
                disabled={loading}
                style={styles.registerButtonInner}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.registerButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </LinearGradient>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Signup */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignup}
              disabled={loading}
            >
              <Icon name="logo-google" size={20} color={COLORS.primary} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                disabled={loading}
              >
                <Text style={styles.loginLink}>Sign In</Text>
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
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  content: {
    padding: 24,
    marginTop: 40,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
  },
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
    color: '#1A1A1A',
    marginLeft: 12,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 10,
    marginLeft: 4,
  },
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    marginTop: 8,
  },
  registerButtonInner: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666666',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 24,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginText: {
    color: '#666666',
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  roleContainer: {
    marginBottom: 24,
    marginTop: 8,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  roleButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  roleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
});
