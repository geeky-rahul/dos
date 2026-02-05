import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Linking,
  TextInput,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';

import { useEffect, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

/* ================= SHOP CARD COMPONENT ================= */

function ShopCard({ item, index, navigation, query }) {
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const hasOffer = item.offer && item.offer > 0;

  const matchingProducts = query
    ? item.products?.filter(p =>
        p.name?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <Animated.View
      style={{
        opacity: cardAnim,
        transform: [
          {
            translateY: cardAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [40, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        style={styles.shopCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ShopDetail', { shop: item })}
      >
        {hasOffer && (
          <View style={styles.offerBadge}>
            <Text style={styles.offerText}>{item.offer}% OFF</Text>
          </View>
        )}

        <View style={styles.shopImagePlaceholder}>
          <Text style={styles.shopImageEmoji}>🏪</Text>
        </View>

        <View style={styles.shopInfo}>
          <Text style={styles.shopName} numberOfLines={1}>
            {item.name}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.ratingBox}>
              <Text style={styles.ratingText}>⭐ {item.rating || '4.5'}</Text>
            </View>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {item.area}, {item.city}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <View style={styles.distanceTag}>
              <Text style={styles.distanceText}>📍 2.3 km</Text>
            </View>
            <View style={[styles.statusTag, item.isOpen && styles.openTag]}>
              <View style={[styles.statusDot, item.isOpen && styles.openDot]} />
              <Text style={[styles.statusText, item.isOpen && styles.openText]}>
                {item.isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
          </View>

          {matchingProducts.length > 0 && (
            <View style={styles.matchContainer}>
              <Text style={styles.matchIcon}>✓</Text>
              <Text style={styles.matchText}>
                {matchingProducts.length} matching product
                {matchingProducts.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {item.products && item.products.length > 0 && !query && (
            <Text style={styles.productsPreview} numberOfLines={1}>
              {item.products.slice(0, 3).map((p) => p.name).join(' • ')}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => item.mapUrl && Linking.openURL(item.mapUrl)}
          activeOpacity={0.8}
        >
          <Text style={styles.mapIcon}>📍</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ================= HOME SCREEN ================= */

export default function HomeScreen({ navigation }) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const categories = ['All', 'Electronics', 'Clothing', 'Food', 'Hardware', 'Books'];

  useEffect(() => {
    fetchShops();

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

  const fetchShops = async () => {
    try {
      const res = await fetch('http://10.0.2.2:5000/api/shops');
      const data = await res.json();
      setShops(data.shops || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchShops();
  };

  const filteredShops = shops.filter(shop => {
    if (activeCategory !== 'All' && shop.category !== activeCategory) return false;
    if (!query.trim()) return true;

    const q = query.toLowerCase();
    return (
      shop.name?.toLowerCase().includes(q) ||
      shop.products?.some(p => p.name?.toLowerCase().includes(q))
    );
  });

  const renderShop = ({ item, index }) => (
    <ShopCard
      item={item}
      index={index}
      navigation={navigation}
      query={query}
    />
  );

  const renderCategoryChip = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        activeCategory === item && styles.activeCategory,
      ]}
      onPress={() => setActiveCategory(item)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.categoryText,
          activeCategory === item && styles.activeCategoryText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.loaderEmoji}>🏪</Text>
        <Text style={styles.loaderText}>Finding shops near you...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* HEADER */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerGreeting}>Hello! 👋</Text>
          <TouchableOpacity style={styles.locationButton}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationName}>Faridabad</Text>
            <Text style={styles.locationDropdown}>▼</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Account')}
          activeOpacity={0.8}
        >
          <View style={styles.profileCircle}>
            <Text style={styles.profileEmoji}>👤</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* SEARCH */}
      <Animated.View
        style={[
          styles.searchContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search for shops or products..."
            placeholderTextColor="#999"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* CATEGORY */}
      <Animated.View
        style={[
          styles.categoryContainer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          renderItem={renderCategoryChip}
          contentContainerStyle={styles.categoryList}
        />
      </Animated.View>

      {/* SHOPS LIST */}
      <FlatList
        data={filteredShops}
        keyExtractor={item => item._id}
        renderItem={renderShop}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={() => (
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>
              {query
                ? `${filteredShops.length} results for "${query}"`
                : activeCategory === 'All'
                ? `${filteredShops.length} shops near you`
                : `${filteredShops.length} ${activeCategory} shops`}
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No shops found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or category filter
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  loaderContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loaderEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },

  loaderText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },

  /* HEADER */
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },

  headerLeft: {
    flex: 1,
  },

  headerGreeting: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    opacity: 0.9,
  },

  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },

  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },

  locationIcon: {
    fontSize: 14,
    marginRight: 4,
  },

  locationName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    marginRight: 4,
  },

  locationDropdown: {
    color: '#FFF',
    fontSize: 10,
    opacity: 0.8,
  },

  profileButton: {
    marginLeft: 12,
  },

  profileCircle: {
    backgroundColor: '#FFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  profileEmoji: {
    fontSize: 20,
  },

  /* SEARCH */
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 16,
    zIndex: 10,
  },

  searchWrapper: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  searchBox: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },

  clearButton: {
    padding: 4,
  },

  clearIcon: {
    fontSize: 16,
    color: '#999',
  },

  /* CATEGORY FILTER */
  categoryContainer: {
    marginBottom: 8,
  },

  categoryList: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },

  categoryChip: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },

  activeCategory: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },

  activeCategoryText: {
    color: '#FFF',
  },

  /* LIST */
  listContent: {
    paddingBottom: 20,
  },

  listHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  /* SHOP CARD */
  shopCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },

  offerBadge: {
    position: 'absolute',
    top: -6,
    right: 12,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },

  offerText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  shopImagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  shopImageEmoji: {
    fontSize: 32,
  },

  shopInfo: {
    flex: 1,
    paddingTop: 2,
  },

  shopName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  ratingBox: {
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFE066',
  },

  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4A800',
  },

  separator: {
    marginHorizontal: 6,
    color: '#CCC',
    fontSize: 12,
  },

  locationText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  distanceTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },

  distanceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555',
  },

  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  openTag: {
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

  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },

  matchIcon: {
    fontSize: 12,
    color: '#22C55E',
    marginRight: 4,
  },

  matchText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '700',
  },

  productsPreview: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    fontStyle: 'italic',
  },

  mapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  mapIcon: {
    fontSize: 18,
  },

  /* EMPTY STATE */
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },

  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});