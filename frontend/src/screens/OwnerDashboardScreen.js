import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { OWNER_COLORS, COLORS } from '../constants/colors';

export default function OwnerDashboardScreen({ navigation }) {
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('21:00');
  const [isOpen, setIsOpen] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [editFormData, setEditFormData] = useState({
    shopName: '',
    email: '',
    phone: '',
    category: '',
    area: '',
    city: '',
  });

  useEffect(() => {
    const currentUser = auth().currentUser;
    setUser(currentUser);
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken(true);
      const response = await fetch('http://10.0.2.2:5000/api/shops/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const payload = await response.json();
        const data = Array.isArray(payload) ? payload[0] : payload;
        if (!data) {
          setShopData(null);
          return;
        }

        setShopData(data);
        setEditFormData({
          shopName: data.name || data.shopName || '',
          email: data.email || '',
          phone: data.contact?.phone || data.phone || '',
          category: data.category || '',
          area: data.area || '',
          city: data.city || '',
        });
        setOpenTime(data.openTime || data.openingTime || '09:00');
        setCloseTime(data.closeTime || data.closingTime || '21:00');
        setIsOpen(data.isOpen !== false);
      } else {
        setShopData(null);
      }
    } catch (error) {
      console.error('Error fetching shop data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchShopData();
    setRefreshing(false);
  };

  const handleUpdateShopInfo = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) throw new Error('Not authenticated');
      const token = await currentUser.getIdToken(true);

      const response = await fetch('http://10.0.2.2:5000/api/shops/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Shop information updated!');
        setEditModalVisible(false);
        await fetchShopData();
      } else {
        let txt = await response.text();
        try {
          const json = JSON.parse(txt);
          txt = json.message || txt;
        } catch (e) {}
        Alert.alert('Error', txt || 'Failed to update shop information');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleUpdateTimings = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) throw new Error('Not authenticated');
      const token = await currentUser.getIdToken(true);

      const response = await fetch('http://10.0.2.2:5000/api/shops/timings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          openTime,
          closeTime,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Shop timings updated!');
        await fetchShopData();
      } else {
        let txt = await response.text();
        try {
          const json = JSON.parse(txt);
          txt = json.message || txt;
        } catch (e) {}
        Alert.alert('Error', txt || 'Failed to update timings');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleToggleShopOpen = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) throw new Error('Not authenticated');
      const token = await currentUser.getIdToken(true);

      const response = await fetch('http://10.0.2.2:5000/api/shops/toggle-open', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isOpen: !isOpen }),
      });

      if (response.ok) {
        setIsOpen(!isOpen);
        Alert.alert('Success', `Shop ${!isOpen ? 'opened' : 'closed'}!`);
        await fetchShopData();
      } else {
        let txt = await response.text();
        try {
          const json = JSON.parse(txt);
          txt = json.message || txt;
        } catch (e) {}
        Alert.alert('Error', txt || 'Failed to update shop status');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.multiRemove(['userToken', 'userId', 'userRole', 'shopProfileComplete']);
            await auth().signOut();

            // Ensure navigation returns to Login and clears stack
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={OWNER_COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={OWNER_COLORS.primary} barStyle="light-content" />

      {/* HEADER */}
      <LinearGradient
        colors={[OWNER_COLORS.primary, OWNER_COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome Back!</Text>
            <Text style={styles.ownerName}>{user?.displayName || 'Shop Owner'}</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
          >
            <Icon name="log-out" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      >
        {shopData ? (
          <>
            {/* SHOP STATUS CARD */}
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <View>
                  <Text style={styles.shopName}>{shopData.name || shopData.shopName || 'My Shop'}</Text>
                  <Text style={styles.shopCategory}>{shopData.category || 'General'}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.statusBadge, isOpen ? styles.statusOpen : styles.statusClosed]}
                  onPress={handleToggleShopOpen}
                >
                  <Icon name={isOpen ? 'checkmark-circle' : 'close-circle'} size={20} color="#fff" />
                  <Text style={styles.statusText}>{isOpen ? 'Open' : 'Closed'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.shopLocation}>📍 {shopData.area || 'Area'}, {shopData.city || 'City'}</Text>
              <Text style={styles.shopEmail}>✉️ {shopData.email || user?.email}</Text>
              <Text style={styles.shopPhone}>📱 {shopData.contact?.phone || shopData.phone || 'N/A'}</Text>
            </View>

            {/* ACTION CARDS GRID */}
            <View style={styles.gridContainer}>
              {/* Edit Shop Info */}
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => setEditModalVisible(true)}
              >
                <Icon name="pencil" size={28} color={OWNER_COLORS.primary} />
                <Text style={styles.actionTitle}>Edit Shop Info</Text>
                <Text style={styles.actionDesc}>Update details</Text>
              </TouchableOpacity>

              {/* Shop Timings */}
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => Alert.alert('Shop Hours', `Open: ${openTime}\nClose: ${closeTime}`)}
              >
                <Icon name="time" size={28} color={OWNER_COLORS.primary} />
                <Text style={styles.actionTitle}>Shop Hours</Text>
                <Text style={styles.actionDesc}>{openTime} - {closeTime}</Text>
              </TouchableOpacity>

              {/* Add Product */}
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('AddProduct', { shopId: shopData?._id || auth().currentUser?.uid })}
              >
                <Icon name="add-circle" size={28} color={OWNER_COLORS.primary} />
                <Text style={styles.actionTitle}>Add Product</Text>
                <Text style={styles.actionDesc}>New listing</Text>
              </TouchableOpacity>

              {/* Manage Products */}
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('ManageProducts', { shopId: shopData?._id || auth().currentUser?.uid })}
              >
                <Icon name="list" size={28} color={OWNER_COLORS.primary} />
                <Text style={styles.actionTitle}>Manage Products</Text>
                <Text style={styles.actionDesc}>Edit inventory</Text>
              </TouchableOpacity>
            </View>

            {/* STATS SECTION */}
            <Text style={styles.sectionTitle}>Quick Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Products</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Reviews</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Icon name="storefront" size={64} color={OWNER_COLORS.primary} />
            <Text style={styles.noDataTitle}>No Shop Setup</Text>
            <Text style={styles.noDataText}>Create your shop profile to start</Text>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { marginTop: 16, minWidth: 180 }]}
              onPress={() => navigation.navigate('ShopSetup')}
            >
              <Text style={styles.buttonText}>Setup Shop</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* EDIT SHOP INFO MODAL */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Icon name="close" size={28} color={OWNER_COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Shop Information</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Shop Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Shop Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter shop name"
                value={editFormData.shopName}
                onChangeText={(text) => setEditFormData({ ...editFormData, shopName: text })}
              />
            </View>

            {/* Email */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email"
                value={editFormData.email}
                keyboardType="email-address"
                onChangeText={(text) => setEditFormData({ ...editFormData, email: text })}
              />
            </View>

            {/* Phone */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone"
                value={editFormData.phone}
                keyboardType="phone-pad"
                onChangeText={(text) => setEditFormData({ ...editFormData, phone: text })}
              />
            </View>

            {/* Category */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter category"
                value={editFormData.category}
                onChangeText={(text) => setEditFormData({ ...editFormData, category: text })}
              />
            </View>

            {/* Area */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Area</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter area"
                value={editFormData.area}
                onChangeText={(text) => setEditFormData({ ...editFormData, area: text })}
              />
            </View>

            {/* City */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter city"
                value={editFormData.city}
                onChangeText={(text) => setEditFormData({ ...editFormData, city: text })}
              />
            </View>

            {/* SHOP HOURS SECTION */}
            <View style={styles.timingSection}>
              <Text style={styles.timingTitle}>Shop Hours</Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Opening Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  value={openTime}
                  onChangeText={setOpenTime}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Closing Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  value={closeTime}
                  onChangeText={setCloseTime}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, styles.timingButton]}
                onPress={handleUpdateTimings}
              >
                <Text style={styles.buttonText}>Update Hours</Text>
              </TouchableOpacity>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleUpdateShopInfo}
            >
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OWNER_COLORS.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  ownerName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 4,
  },
  logoutBtn: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  shopName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  shopCategory: {
    fontSize: 13,
    color: OWNER_COLORS.primary,
    marginTop: 4,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  statusOpen: {
    backgroundColor: COLORS.success,
  },
  statusClosed: {
    backgroundColor: COLORS.error,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  shopLocation: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  shopEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  shopPhone: {
    fontSize: 13,
    color: '#666',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 12,
    textAlign: 'center',
  },
  actionDesc: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: OWNER_COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    fontWeight: '600',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 16,
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  bottomSpace: {
    height: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: OWNER_COLORS.primary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  timingSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 16,
    marginTop: 16,
  },
  timingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timingButton: {
    backgroundColor: OWNER_COLORS.secondary,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: OWNER_COLORS.primary,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
