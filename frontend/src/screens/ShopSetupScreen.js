import React, {useState, useEffect} from 'react';
import {
  View,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';

export default function ShopSetupScreen({ navigation }) {
  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('21:00');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!shopName.trim()) return Alert.alert('Validation', 'Shop name is required');
    setLoading(true);
    try {
      const currentUser = auth().currentUser;
      let token = null;
      if (currentUser) {
        // force refresh token to avoid using a stale/expired token
        token = await currentUser.getIdToken(true);
        console.log('Refreshed Firebase token');
      } else {
        // fallback to AsyncStorage token if auth state isn't populated yet
        token = await AsyncStorage.getItem('userToken');
        console.log('Using token from AsyncStorage');
      }
      if (!token) throw new Error('Not authenticated');

      const body = {
        name: shopName.trim(),
        category: category.trim() || 'General',
        contact: {
          phone: phone.trim(),
          address: address.trim(),
        },
        notice: description.trim(),
        openTime,
        closeTime,
        area: address.split(',').slice(-3, -2)[0] || '',
        city: address.split(',').slice(-2, -1)[0] || '',
      };

      console.log('Creating shop with body:', body);
      const res = await fetch('http://10.0.2.2:5000/api/shops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let txt = await res.text();
        console.warn('Shop create failed, server response:', txt);
        try {
          const json = JSON.parse(txt);
          txt = json.message || JSON.stringify(json);
        } catch (e) {
          // keep original text
        }
        throw new Error(txt || 'Failed to create shop');
      }

      const created = await res.json();
      // Navigate to OwnerDashboard
      navigation.replace('OwnerDashboard');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create shop');
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

        <Text style={styles.label}>Open Time</Text>
        <TextInput style={styles.input} value={openTime} onChangeText={setOpenTime} placeholder="09:00" />

        <Text style={styles.label}>Close Time</Text>
        <TextInput style={styles.input} value={closeTime} onChangeText={setCloseTime} placeholder="21:00" />

        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, {height:100}]} value={description} onChangeText={setDescription} placeholder="Short description" multiline />

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
  uploadBtn: { backgroundColor: COLORS.surface, padding:12, borderRadius:8, marginTop:12, alignItems:'center' },
  uploadText: { color: COLORS.primary, fontWeight:'700' },
  submitBtn: { backgroundColor: COLORS.primary, padding:14, borderRadius:8, marginTop:18, alignItems:'center' },
  submitText: { color:'#fff', fontWeight:'700' },
});
