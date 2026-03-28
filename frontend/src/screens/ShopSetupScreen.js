import React, {useState} from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { COLORS } from '../constants/colors';
import { API_BASE_URL } from '../constants/api';

export default function ShopSetupScreen({ navigation }) {
  console.log('ShopSetupScreen: Component initialized');

  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [rating, setRating] = useState('4.0');
  const [offer, setOffer] = useState('0');
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('21:00');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  console.log('ShopSetupScreen: State initialized');

  const getFreshIdToken = async () => {
    let user = auth().currentUser;
    if (!user) {
      user = await new Promise((resolve) => {
        const timer = setTimeout(() => {
          unsubscribe();
          resolve(null);
        }, 5000);
        const unsubscribe = auth().onAuthStateChanged((currentUser) => {
          clearTimeout(timer);
          unsubscribe();
          resolve(currentUser);
        });
      });
    }

    if (!user) {
      throw new Error('Not authenticated. Please log in again.');
    }

    return user.getIdToken(true);
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!shopName.trim()) {
        Alert.alert('Validation Error', 'Shop name is required');
        return;
      }
      if (!address.trim()) {
        Alert.alert('Validation Error', 'Address is required');
        return;
      }

      console.log('Starting shop creation...');
      setLoading(true);

      // Get authentication token
      console.log('Getting auth token...');
      const token = await getFreshIdToken();
      if (!token) {
        Alert.alert('Authentication Error', 'Please log in again');
        return;
      }
      console.log('Auth token obtained');

      // Prepare data
      const addressParts = address
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const area = addressParts.length >= 3 ? addressParts[addressParts.length - 3] : addressParts[0] || 'General';
      const city = addressParts.length >= 2 ? addressParts[addressParts.length - 2] : addressParts[addressParts.length - 1] || 'Unknown';

      const body = {
        name: shopName.trim(),
        category: category.trim() || 'General',
        rating: rating.trim() || '4.0',
        offer: offer.trim() || '0',
        mapUrl: mapUrl.trim(),
        contact: {
          phone: phone.trim(),
          address: address.trim(),
        },
        notice: description.trim(),
        openTime,
        closeTime,
        area,
        city,
      };

      console.log('Creating shop with body:', body);
      console.log('API URL:', `${API_BASE_URL}/api/shops`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      // Make API call
      const res = await fetch(`${API_BASE_URL}/api/shops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      console.log('API Response status:', res.status);

      if (!res.ok) {
        let errorText = await res.text();
        console.error('API Error response:', errorText);
        try {
          const errorJson = JSON.parse(errorText);
          errorText = errorJson.message || errorText;
        } catch (e) {
          // Keep original text
        }
        throw new Error(errorText || `HTTP ${res.status}: ${res.statusText}`);
      }

      const created = await res.json();
      console.log('Shop created successfully:', created);

      // Navigate to dashboard
      Alert.alert('Success', 'Shop created successfully!', [
        { text: 'OK', onPress: () => navigation.replace('OwnerDashboard') }
      ]);

    } catch (err) {
      console.error('Shop creation error:', err);
      if (err.name === 'AbortError') {
        Alert.alert(
          'Connection Error',
          `Could not reach the backend server.\n\nCurrent API: ${API_BASE_URL}\n\nMake sure the backend is running and your phone/emulator can access your computer on port 5000.`
        );
      } else {
        Alert.alert('Error', err.message || 'Failed to create shop. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Setup Your Shop</Text>

        <Text style={styles.label}>Shop Name</Text>
        <TextInput style={styles.input} value={shopName} onChangeText={setShopName} placeholder="My Shop" />

        <Text style={styles.label}>Category</Text>
        <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="e.g., Electronics" />

        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone number" keyboardType="phone-pad" />

        <Text style={styles.label}>Address</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Street, Area, City" />

        <Text style={styles.label}>Map Link</Text>
        <TextInput
          style={styles.input}
          value={mapUrl}
          onChangeText={setMapUrl}
          placeholder="Google Maps link"
          keyboardType="url"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Rating</Text>
        <TextInput
          style={styles.input}
          value={rating}
          onChangeText={setRating}
          placeholder="4.0"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Offer Percentage</Text>
        <TextInput
          style={styles.input}
          value={offer}
          onChangeText={setOffer}
          placeholder="0"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Open Time</Text>
        <TextInput style={styles.input} value={openTime} onChangeText={setOpenTime} placeholder="09:00" />

        <Text style={styles.label}>Close Time</Text>
        <TextInput style={styles.input} value={closeTime} onChangeText={setCloseTime} placeholder="21:00" />

        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.descriptionInput]} value={description} onChangeText={setDescription} placeholder="Short description" multiline />

        <TouchableOpacity style={styles.uploadBtn} onPress={() => Alert.alert('Upload','This is a dummy upload button')}>
          <Text style={styles.uploadText}>Upload Image (dummy)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.submitText}>Save Shop</Text>}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor: '#F8F9FA' },
  content: { padding: 20 },
  title: { fontSize:22, fontWeight:'700', marginBottom:16, color: COLORS.primary },
  label: { fontSize:13, fontWeight:'600', marginTop:12, marginBottom:6 },
  input: { backgroundColor:'#fff', borderRadius:8, padding:12, borderWidth:1, borderColor:'#EAEAEA' },
  descriptionInput: { height:100, textAlignVertical:'top' },
  uploadBtn: { backgroundColor: COLORS.surface, padding:12, borderRadius:8, marginTop:12, alignItems:'center' },
  uploadText: { color: COLORS.primary, fontWeight:'700' },
  submitBtn: { backgroundColor: COLORS.primary, padding:14, borderRadius:8, marginTop:18, alignItems:'center' },
  submitText: { color:'#fff', fontWeight:'700' },
});
