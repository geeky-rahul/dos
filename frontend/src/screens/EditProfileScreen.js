import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants/colors';
import InputField from '../components/InputField';
import AppButton from '../components/AppButton';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncUserWithBackend, updateUserProfile } from '../services/authService';

export default function EditProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Try to get data from backend first
      const backendData = await syncUserWithBackend();
      if (backendData) {
        setUserData({
          name: backendData.name || '',
          email: backendData.email || '',
          phone: backendData.phone || '',
        });
        return;
      }

      // Try cached data as a fallback
      const cachedData = await AsyncStorage.getItem('userData');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        setUserData({
          name: parsed.name || '',
          email: parsed.email || '',
          phone: parsed.phone || '',
        });
        return;
      }
    } catch (error) {
      console.log('Backend sync failed, using cache/Firebase fallback:', error.message);
    }

    try {
      // Fallback to Firebase auth data
      const user = auth().currentUser;
      if (user) {
        setUserData({
          name: user.displayName || '',
          email: user.email || '',
          phone: '',
        });
      }
    } catch (error) {
      console.log('Firebase auth failed:', error.message);
      // Set default empty data
      setUserData({
        name: '',
        email: '',
        phone: '',
      });
    }
  };

  const handleSave = async () => {
    if (!userData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setLoading(true);
    try {
      // Ensure the user can change email in backend + sync locally
      const newProfile = {
        name: userData.name.trim(),
        email: userData.email.trim(),
        phone: userData.phone.trim(),
      };

      // Optional: update Firebase auth email (requires reauth on sensitive changes)
      const currentUser = auth().currentUser;
      if (currentUser && newProfile.email && currentUser.email !== newProfile.email) {
        try {
          await currentUser.updateEmail(newProfile.email);
        } catch (authErr) {
          console.warn('Firebase updateEmail failed (user may need reauth):', authErr.message);
        }
      }

      const updatedUser = await updateUserProfile(newProfile);

      if (updatedUser) {
        // Keep local state in sync
        setUserData({
          name: updatedUser.name || userData.name,
          email: updatedUser.email || userData.email,
          phone: updatedUser.phone || userData.phone,
        });

        // Update local storage
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));

        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Icon name="chevron-back" size={28} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.content}>
          {/* FORM FIELDS */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <InputField
                value={userData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Enter your full name"
                icon="person"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <InputField
                value={userData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="Enter your email"
                icon="mail"
                keyboardType="email-address"
                editable={true}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <InputField
                value={userData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder="Enter your phone number"
                icon="call"
                keyboardType="phone-pad"
                editable={true}
              />
            </View>
          </View>

          {/* SAVE BUTTON */}
          <View style={styles.buttonSection}>
            <AppButton
              title={loading ? "Saving..." : "Save Changes"}
              onPress={handleSave}
              disabled={loading}
              style={styles.saveButton}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 50, // Account for status bar
  },

  /* HEADER */
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },

  backButton: {
    padding: 8,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },

  placeholder: {
    width: 40,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: 16,
  },

  /* AVATAR SECTION */
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },

  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },

  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  changePhotoText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },

  /* FORM SECTION */
  formSection: {
    marginBottom: 32,
  },

  inputGroup: {
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },

  /* BUTTON SECTION */
  buttonSection: {
    marginTop: 16,
  },

  saveButton: {
    marginBottom: 20,
  },
});