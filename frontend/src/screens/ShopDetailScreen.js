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
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
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
            <Icon name="cube" size={32} color={COLORS.primary} />
            {hasDiscount && (
              <LinearGradient
                colors={[COLORS.error, COLORS.error + 'CC']}
                style={styles.discountBadge}
              >
                <Text style={styles.discountText}>{discountPercent}%</Text>
              </LinearGradient>
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
          <Icon name="chevron-back" size={24} color="#FFF" />
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
          <Icon name="share-social" size={20} color="#FFF" />
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
              <Icon name="storefront" size={32} color={COLORS.primary} />
            </View>

            <View style={styles.shopDetails}>
              <View style={styles.ratingRow}>
                <View style={styles.ratingBadge}>
                  <Icon name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>{shop.rating || '4.5'}</Text>
                </View>
                <Text style={styles.reviewsText}>(250+ reviews)</Text>
              </View>

              <View style={styles.addressRow}>
                <Icon name="location" size={14} color={COLORS.primary} />
                <Text style={styles.addressText}>
                  {shop.area || 'Area'}, {shop.city || 'City'}
                </Text>
              </View>

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
              <Icon name="call" size={18} color={COLORS.primary} />
              <Text style={styles.actionText}>Call</Text>
            </TouchableOpacity>

            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryActionButton}
            >
              <TouchableOpacity
                onPress={openMaps}
                activeOpacity={0.8}
                style={styles.primaryActionInner}
              >
                <Icon name="navigate" size={18} color="#FFF" />
                <Text style={styles.primaryActionText}>Get Directions</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Offers Section */}
          {shop.offer && shop.offer > 0 && (
            <LinearGradient
              colors={['rgba(245, 158, 11, 0.1)', 'rgba(245, 158, 11, 0.05)']}
              style={styles.offerContainer}
            >
              <View style={styles.offerIcon}>
                <Icon name="flash" size={20} color="#F59E0B" />
              </View>
              <View style={styles.offerContent}>
                <Text style={styles.offerTitle}>Special Offer!</Text>
                <Text style={styles.offerDesc}>
                  Get {shop.offer}% off on all products
                </Text>
              </View>
            </LinearGradient>
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
              <Icon name="cube-outline" size={48} color={COLORS.textMuted} />
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
    backgroundColor: COLORS.background,
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
    paddingVertical: 12,
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

  /* SHOP INFO CARD */
  shopInfoCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    borderRadius: 14,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  shopDetails: {
    flex: 1,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  ratingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },

  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F59E0B',
    marginLeft: 4,
  },

  reviewsText: {
    marginLeft: 8,
    fontSize: 12,
    color: COLORS.textMuted,
  },

  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  addressText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },

  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  openBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.error,
    marginRight: 4,
  },

  openDot: {
    backgroundColor: COLORS.success,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.error,
  },

  openText: {
    color: COLORS.success,
  },

  timingText: {
    marginLeft: 8,
    fontSize: 12,
    color: COLORS.textMuted,
  },

  /* ACTION BUTTONS */
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  primaryActionButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },

  primaryActionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },

  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 6,
  },

  primaryActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },

  /* OFFERS */
  offerContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },

  offerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },

  offerContent: {
    flex: 1,
    justifyContent: 'center',
  },

  offerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 2,
  },

  offerDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.surface,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  activeTabChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
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
    color: COLORS.text,
  },

  productCount: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  /* PRODUCT CARD */
  productCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
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
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },

  discountBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  discountText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },

  productInfo: {
    flex: 1,
  },

  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },

  productDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
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
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 6,
  },

  originalPrice: {
    fontSize: 13,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },

  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },

  stockDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.success,
    marginRight: 4,
  },

  stockText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.success,
  },

  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },

  tag: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },

  tagText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
  },

  /* EMPTY STATE */
  emptyProducts: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 8,
  },
});