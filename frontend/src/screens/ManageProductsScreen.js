import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import { COLORS } from '../constants/colors';

export default function ManageProductsScreen({ route, navigation }) {
  const { shopId } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/products/shop/${shopId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleToggleOffer = async (productId, currentStatus) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) throw new Error('Not authenticated');
      const token = await currentUser.getIdToken(true);

      const response = await fetch(`http://10.0.2.2:5000/api/products/${productId}/offer`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isOnOffer: !currentStatus }),
      });
      if (!response.ok) {
        throw new Error('Failed to toggle offer');
      }
      fetchProducts();
      Alert.alert('Success', `Offer ${!currentStatus ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling offer:', error);
      Alert.alert('Error', 'Failed to update offer');
    }
  };

  const handleDeleteProduct = async (productId) => {
    Alert.alert('Delete Product', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          try {
              const currentUser = auth().currentUser;
              if (!currentUser) throw new Error('Not authenticated');
              const token = await currentUser.getIdToken(true);
              const response = await fetch(`http://10.0.2.2:5000/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              if (!response.ok) throw new Error('Failed to delete product');

              fetchProducts();
              Alert.alert('Success', 'Product deleted');
          } catch (error) {
            console.error('Error deleting product:', error);
            Alert.alert('Error', 'Failed to delete product');
          }
        },
      },
    ]);
  };

  const renderProduct = ({ item }) => {
    return (
      <View>
        <View style={styles.productCard}>
          <View style={styles.productInfo}>
            <View style={styles.productNameRow}>
              <Text style={styles.productName} numberOfLines={1}>
                {item.name}
              </Text>
              {item.isOnOffer && (
                <View style={styles.offerBadge}>
                  <Text style={styles.offerBadgeText}>ON OFFER</Text>
                </View>
              )}
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.price}>₹ {item.price}</Text>
              {item.offerPrice && (
                <Text style={styles.offerPrice}>₹ {item.offerPrice}</Text>
              )}
            </View>

            <Text style={styles.category}>{item.category}</Text>

            {item.description && (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>

          {/* ACTIONS */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                item.isOnOffer ? styles.offerBtnActive : styles.offerBtn,
              ]}
              onPress={() => handleToggleOffer(item._id, item.isOnOffer)}
            >
              <Icon
                name={item.isOnOffer ? 'pricetag' : 'pricetag-outline'}
                size={16}
                color={item.isOnOffer ? COLORS.primary : COLORS.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('AddProduct', { shopId, product: item })}
            >
              <Icon name="pencil" size={16} color={COLORS.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDeleteProduct(item._id)}
            >
              <Icon name="trash" size={16} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon name="cube-outline" size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>No Products Yet</Text>
      <Text style={styles.emptyText}>
        Add products to your shop to get started
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Products</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddProduct', { shopId })}>
          <Icon name="add-circle" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* PRODUCTS LIST */}
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderProduct}
        ListEmptyComponent={EmptyComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListHeaderComponent={() => (
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderText}>
              {products.length} product{products.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      />
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

  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
  },

  listHeader: {
    marginBottom: 12,
  },

  listHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  productCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  productInfo: {
    marginBottom: 12,
  },

  productNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },

  offerBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 8,
  },

  offerBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  price: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 8,
  },

  offerPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
    textDecorationLine: 'line-through',
  },

  category: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },

  description: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },

  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
  },

  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  offerBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },

  offerBtnActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: COLORS.primary,
  },

  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(100, 150, 200, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(100, 150, 200, 0.3)',
  },

  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
