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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { auth } from '../services/firebase';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    try {
      setLoading(true);
      await auth().sendPasswordResetEmail(email.trim());
      setIsEmailSent(true);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      await auth().sendPasswordResetEmail(email.trim());
      Alert.alert('Success', 'Reset email sent again');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  /* ---------------- SUCCESS SCREEN ---------------- */
  if (isEmailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <Icon name="mail-outline" size={80} color="#8B5CF6" />
          </View>

          {/* Success Message */}
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successSubtitle}>
            We've sent a password reset link to{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>
              Click the link in the email to reset your password.
              If you don't see it, check your spam folder.
            </Text>
          </View>

          {/* Resend Button */}
          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendEmail}
          >
            <Text style={styles.resendButtonText}>Resend Email</Text>
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Icon name="arrow-back" size={20} color="#8B5CF6" />
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* ---------------- FORM SCREEN ---------------- */
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.content}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backIconButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                Don't worry! Enter your email and we'll send you a link
                to reset your password.
              </Text>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Icon name="mail-outline" size={20} color="#9CA3AF" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetPassword}
              disabled={loading}
            >
              <Text style={styles.resetButtonText}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------------- STYLES (UNCHANGED) ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  backIconButton: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  resetButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 40,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emailText: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  instructionsContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  instructionsText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    textAlign: 'center',
  },
  resendButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  resendButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
