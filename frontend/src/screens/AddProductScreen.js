import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import { COLORS } from '../constants/colors';

export default function AddProductScreen({ route, navigation }) {
  const { shopId } = route.params;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    offerPrice: '',
    description: '',
    category: 'General',
  });

  const handleAddProduct = async () => {
    // Validation
    if (!formData.name.trim() || !formData.price) {
      Alert.alert('Error', 'Name and price are required');
      return;
    }

    if (isNaN(parseFloat(formData.price))) {
      Alert.alert('Error', 'Price must be a valid number');
      return;
    }

    setLoading(true);
    try {
      const currentUser = auth().currentUser;
      const token = await currentUser.getIdToken();

      const response = await fetch(
        `http://10.0.2.2:5000/api/products/shop/${shopId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            price: parseFloat(formData.price),
            offerPrice: formData.offerPrice ? parseFloat(formData.offerPrice) : null,
            description: formData.description,
            category: formData.category,
          }),
        }
      );

      if (response.ok) {
        Alert.alert('Success', 'Product added successfully', [
          {
            text: 'OK',
            onPress: () => {
              setFormData({ name: '', price: '', offerPrice: '', description: '', category: 'General' });
              navigation.goBack();
            },
          },
        ]);
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Product</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* FORM */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Product Details</Text>

          {/* Product Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Fresh Milk"
              placeholderTextColor={COLORS.textMuted}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          {/* Price */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Price (₹) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 40"
              placeholderTextColor={COLORS.textMuted}
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Offer Price */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Offer Price (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 35"
              placeholderTextColor={COLORS.textMuted}
              value={formData.offerPrice}
              onChangeText={(text) => setFormData({ ...formData, offerPrice: text })}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Category */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryButtons}>
              {['General', 'Food', 'Electronics', 'Books'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryBtn,
                    formData.category === cat && styles.categoryBtnActive,
                  ]}
                  onPress={() => setFormData({ ...formData, category: cat })}
                >
                  <Text
                    style={[
                      styles.categoryBtnText,
                      formData.category === cat && styles.categoryBtnTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add product details..."
              placeholderTextColor={COLORS.textMuted}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleAddProduct}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitBtnText}>Add Product</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  formSection: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },

  formGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },

  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },

  textArea: {
    textAlignVertical: 'top',
    paddingTop: 12,
  },

  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  categoryBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },

  categoryBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  categoryBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  categoryBtnTextActive: {
    color: '#FFF',
  },

  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },

  submitBtnDisabled: {
    opacity: 0.7,
  },

  submitBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
