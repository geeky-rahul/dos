import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants/colors';
import auth from '@react-native-firebase/auth';
import { createShopDoc } from '../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ShopDetailsScreen({ navigation, route }) {
  const currentUser = auth().currentUser;
  const uid = route?.params?.uid || currentUser?.uid;

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    shopName: '',
    description: '',
    address: '',
    phone: '',
    category: '',
    openingTime: '09:00',
    closingTime: '21:00',
  });

  const handleSubmit = async () => {
    const { shopName, phone, address } = form;
    if (!shopName.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Error', 'Shop name, phone and address are required');
      return;
    }

    setLoading(true);
    try {
        console.log('ShopDetails: submit start', { uid, form });
      await createShopDoc(uid, form);
        console.log('ShopDetails: createShopDoc returned');
      // Mark shopProfileComplete locally
      await AsyncStorage.setItem('shopProfileComplete', 'true');
        console.log('ShopDetails: shopProfileComplete stored');

      // Go to Owner Dashboard
      navigation.replace('OwnerDashboard');
    } catch (err) {
      console.error('Error creating shop:', err);
      Alert.alert('Error', 'Failed to save shop details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Complete your shop details</Text>

        <Text style={styles.label}>Shop Name *</Text>
        <TextInput
          style={styles.input}
          value={form.shopName}
          onChangeText={(t) => setForm({ ...form, shopName: t })}
          placeholder="e.g., Rahul Dairy"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.description}
          onChangeText={(t) => setForm({ ...form, description: t })}
          placeholder="Short description"
          multiline
        />

        <Text style={styles.label}>Address *</Text>
        <TextInput
          style={styles.input}
          value={form.address}
          onChangeText={(t) => setForm({ ...form, address: t })}
          placeholder="Street, area, city"
        />

        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          value={form.phone}
          onChangeText={(t) => setForm({ ...form, phone: t })}
          placeholder="Contact number"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Category</Text>
        <TextInput
          style={styles.input}
          value={form.category}
          onChangeText={(t) => setForm({ ...form, category: t })}
          placeholder="e.g., Grocery"
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Opening Time</Text>
            <TextInput
              style={styles.input}
              value={form.openingTime}
              onChangeText={(t) => setForm({ ...form, openingTime: t })}
              placeholder="09:00"
            />
          </View>

          <View style={{ width: 12 }} />

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Closing Time</Text>
            <TextInput
              style={styles.input}
              value={form.closingTime}
              onChangeText={(t) => setForm({ ...form, closingTime: t })}
              placeholder="21:00"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Save Shop</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16, color: COLORS.text },
  label: { fontSize: 14, marginTop: 12, marginBottom: 6, color: COLORS.textSecondary },
  input: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', marginTop: 8 },
  submitBtn: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 10, marginTop: 20, alignItems: 'center' },
  submitText: { color: '#FFF', fontWeight: '700' },
});
