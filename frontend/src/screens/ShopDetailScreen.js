import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Linking,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';

import { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

export default function ShopDetailScreen({ route, navigation }) {
  const { shop } = route.params;
  const [activeTab, setActiveTab] = useState('All');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const openMaps = () => {
    if (shop.mapUrl) {
      Linking.openURL(shop.mapUrl);
    }
  };

  const callShop = () => {
    if (shop.phone) {
      Linking.openURL(`tel:${shop.phone}`);
    }
  };

  // Safely get categories
  const categories = ['All'];
  
  // Filter products by category with safety checks
  const allProducts = shop.products || [];
  const filteredProducts = activeTab === 'All' 
    ? allProducts
    : allProducts.filter(p => p.category === activeTab);

  // Product Card Component
  const ProductCard = ({ item, index }) => {
    const productAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(productAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }).start();
    }, []);

    const hasDiscount = item.originalPrice && item.price < item.originalPrice;
    const discountPercent = hasDiscount
      ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
      : 0;

    return (
      <Animated.View
        style={{
          opacity: productAnim,
          transform: [
            {
              translateY: productAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        }}
      >
        <View style={styles.productCard}>
          {/* Product Image */}
          <View style={styles.productImage}>
            <Text style={styles.productEmoji}>📦</Text>
            {hasDiscount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{discountPercent}% OFF</Text>
              </View>
            )}
          </View>

          {/* Product Info */}
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name || 'Product'}
            </Text>

            {item.description && (
              <Text style={styles.productDesc} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            {/* Price Section */}
            <View style={styles.priceRow}>
              <View style={styles.priceContainer}>
                <Text style={styles.currentPrice}>
                  ₹{item.price || '0'}
                </Text>
                {hasDiscount && (
                  <Text style={styles.originalPrice}>
                    ₹{item.originalPrice}
                  </Text>
                )}
              </View>

              {item.inStock !== false && (
                <View style={styles.stockBadge}>
                  <View style={styles.stockDot} />
                  <Text style={styles.stockText}>In Stock</Text>
                </View>
              )}
            </View>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {item.tags.slice(0, 2).map((tag, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderCategoryTab = ({ item }) => (
    <TouchableOpacity
      style={[styles.tabChip, activeTab === item && styles.activeTabChip]}
      onPress={() => setActiveTab(item)}
      activeOpacity={0.7}
    >
      <Text style={[styles.tabText, activeTab === item && styles.activeTabText]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* CUSTOM HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {shop.name || 'Shop Details'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {allProducts.length} Products Available
          </Text>
        </View>

        <TouchableOpacity style={styles.shareButton} activeOpacity={0.8}>
          <Text style={styles.shareIcon}>↗️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* SHOP INFO CARD */}
        <Animated.View
          style={[
            styles.shopInfoCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Shop Header */}
          <View style={styles.shopHeader}>
            <View style={styles.shopIconContainer}>
              <Text style={styles.shopIcon}>🏪</Text>
            </View>

            <View style={styles.shopDetails}>
              <View style={styles.ratingRow}>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>⭐ {shop.rating || '4.5'}</Text>
                </View>
                <Text style={styles.reviewsText}>(250+ reviews)</Text>
              </View>

              <Text style={styles.addressText}>
                📍 {shop.area || 'Area'}, {shop.city || 'City'}
              </Text>

              <View style={styles.timingRow}>
                <View style={[styles.statusBadge, shop.isOpen && styles.openBadge]}>
                  <View style={[styles.statusDot, shop.isOpen && styles.openDot]} />
                  <Text style={[styles.statusText, shop.isOpen && styles.openText]}>
                    {shop.isOpen ? 'Open Now' : 'Closed'}
                  </Text>
                </View>
                <Text style={styles.timingText}>• 9:00 AM - 9:00 PM</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={callShop}
              activeOpacity={0.8}
            >
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={styles.actionText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.primaryActionButton]}
              onPress={openMaps}
              activeOpacity={0.8}
            >
              <Text style={styles.actionIcon}>📍</Text>
              <Text style={[styles.actionText, styles.primaryActionText]}>
                Get Directions
              </Text>
            </TouchableOpacity>
          </View>

          {/* Offers Section */}
          {shop.offer && shop.offer > 0 && (
            <View style={styles.offerContainer}>
              <View style={styles.offerIcon}>
                <Text style={styles.offerEmoji}>🎉</Text>
              </View>
              <View style={styles.offerContent}>
                <Text style={styles.offerTitle}>Special Offer!</Text>
                <Text style={styles.offerDesc}>
                  Get {shop.offer}% off on all products
                </Text>
              </View>
            </View>
          )}
        </Animated.View>

        {/* CATEGORY TABS */}
        {categories.length > 1 && (
          <View style={styles.tabsContainer}>
            <FlatList
              data={categories}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              renderItem={renderCategoryTab}
              contentContainerStyle={styles.tabsList}
            />
          </View>
        )}

        {/* PRODUCTS SECTION */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Products</Text>
            <Text style={styles.productCount}>
              {filteredProducts.length} items
            </Text>
          </View>

          {filteredProducts.length > 0 ? (
            filteredProducts.map((item, index) => (
              <ProductCard key={item._id || index} item={item} index={index} />
            ))
          ) : (
            <View style={styles.emptyProducts}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyText}>
                {allProducts.length === 0 
                  ? 'No products available' 
                  : 'No products in this category'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  scrollContent: {
    paddingBottom: 20,
  },

  /* HEADER */
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backIcon: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: '600',
  },

  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
  },

  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },

  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },

  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  shareIcon: {
    fontSize: 18,
  },

  /* SHOP INFO CARD */
  shopInfoCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  shopHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },

  shopIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  shopIcon: {
    fontSize: 32,
  },

  shopDetails: {
    flex: 1,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  ratingBadge: {
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE066',
  },

  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4A800',
  },

  reviewsText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#666',
  },

  addressText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 6,
    fontWeight: '500',
  },

  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  openBadge: {
    backgroundColor: '#E6F7E6',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF4444',
    marginRight: 4,
  },

  openDot: {
    backgroundColor: '#22C55E',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF4444',
  },

  openText: {
    color: '#22C55E',
  },

  timingText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
  },

  /* ACTION BUTTONS */
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },

  primaryActionButton: {
    backgroundColor: COLORS.primary,
  },

  actionIcon: {
    fontSize: 18,
    marginRight: 6,
  },

  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  primaryActionText: {
    color: '#FFF',
  },

  /* OFFERS */
  offerContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF4E5',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },

  offerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  offerEmoji: {
    fontSize: 20,
  },

  offerContent: {
    flex: 1,
  },

  offerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E65100',
    marginBottom: 2,
  },

  offerDesc: {
    fontSize: 12,
    color: '#F57C00',
  },

  /* CATEGORY TABS */
  tabsContainer: {
    marginTop: 16,
    marginBottom: 12,
  },

  tabsList: {
    paddingHorizontal: 16,
  },

  tabChip: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },

  activeTabChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },

  activeTabText: {
    color: '#FFF',
  },

  /* PRODUCTS SECTION */
  productsSection: {
    marginTop: 8,
    paddingHorizontal: 16,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  productCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  /* PRODUCT CARD */
  productCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },

  productEmoji: {
    fontSize: 28,
  },

  discountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  discountText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },

  productInfo: {
    flex: 1,
  },

  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },

  productDesc: {
    fontSize: 12,
    color: '#777',
    marginBottom: 6,
    lineHeight: 16,
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  currentPrice: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 6,
  },

  originalPrice: {
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'line-through',
  },

  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7E6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  stockDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#22C55E',
    marginRight: 4,
  },

  stockText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#22C55E',
  },

  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },

  tag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },

  tagText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },

  /* EMPTY STATE */
  emptyProducts: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },

  emptyText: {
    fontSize: 14,
    color: '#999',
  },
});