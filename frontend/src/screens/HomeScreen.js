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
  Platform,
  PermissionsAndroid,
} from 'react-native';

import { useEffect, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants/colors';
import Geolocation from 'react-native-geolocation-service';

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
          <Icon name="storefront" size={32} color={COLORS.primary} />
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
              <Icon name="location" size={12} color={COLORS.textSecondary} />
              <Text style={[styles.distanceText, { marginLeft: 6 }]}>2.3 km</Text>
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
              <Icon name="checkmark" size={12} color={COLORS.success} style={{ marginRight: 6 }} />
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
          <Icon name="location" size={18} color="#FFF" />
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

  const [userLocation, setUserLocation] = useState('Current Location');
  const [locationCoords, setLocationCoords] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const categories = ['All', 'Electronics', 'Clothing', 'Food', 'Hardware', 'Books'];

  useEffect(() => {
    fetchShops();
    getCurrentLocation();

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

    // 🔥 LOCATION FUNCTION WITH REVERSE GEOCODING
  const getCurrentLocation = async () => {
    try {
      let hasPermission = true;

      // Check and request permission on Android
      if (Platform.OS === 'android') {
        try {
          const checkPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );

          if (!checkPermission) {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              {
                title: 'Location Permission Required',
                message: 'This app needs access to your location to show nearby shops',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Deny',
                buttonPositive: 'Allow',
              }
            );
            hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
          }
        } catch (err) {
          console.log('Permission check error:', err);
        }
      }

      if (!hasPermission) {
        setUserLocation('Enable Location');
        return;
      }

      setUserLocation('Fetching location...');

      Geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            setLocationCoords({ lat: latitude, lng: longitude });
            console.log('GPS Location found:', latitude, longitude);

            // Call backend for reverse geocoding
            try {
              console.log('Fetching address from backend...');
              const response = await fetch(
                `http://10.0.2.2:5000/api/location/reverse?lat=${latitude}&lng=${longitude}`
              );
              
              if (response.ok) {
                const data = await response.json();
                console.log('Location from backend:', data);
                
                const locationName = `${data.area}, ${data.city}`;
                console.log('Formatted location:', locationName);
                setUserLocation(locationName);
              } else {
                console.log('Backend returned error:', response.status);
                setUserLocation('Faridabad');
              }
            } catch (error) {
              console.log('Backend location error:', error.message);
              setUserLocation('Faridabad');
            }
          } catch (error) {
            console.log('Location processing error:', error);
            setUserLocation('Faridabad');
          }
        },
        (error) => {
          console.log('Geolocation error:', error);
          console.log('Error code:', error.code);
          console.log('Error message:', error.message);
          
          if (error.code === 1) {
            setUserLocation('Permission Denied');
          } else if (error.code === 2) {
            setUserLocation('Location Unavailable');
          } else if (error.code === 3) {
            setUserLocation('Timeout - Try Again');
          } else {
            setUserLocation('Faridabad');
          }
        },
        { enableHighAccuracy: true, timeout: 25000, maximumAge: 0 }
      );
    } catch (err) {
      console.log('Location permission error:', err);
      setUserLocation('Faridabad');
    }
  };
  
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
        <View style={styles.loaderIcon}>
          <Icon name="storefront" size={48} color={COLORS.primary} />
        </View>
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
          <Text style={styles.headerGreeting}>Discover Shops</Text>
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={getCurrentLocation}
          >
            <Icon name="location" size={16} color="#FFF" />
            <Text style={styles.locationName}>{String(userLocation || 'Current Location')}</Text>
            <Icon name="chevron-down" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Account')}
          activeOpacity={0.8}
        >
          <View style={styles.profileCircle}>
            <Icon name="person" size={20} color={COLORS.primary} />
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
          <Icon name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            placeholder="Search shops or products..."
            placeholderTextColor={COLORS.textMuted}
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
              <Icon name="close" size={18} color={COLORS.textMuted} />
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
            <View style={styles.emptyIcon}>
              <Icon name="search" size={48} color={COLORS.textMuted} />
            </View>
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
    backgroundColor: COLORS.background,
  },

  loaderContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loaderIcon: {
    marginBottom: 16,
  },

  loaderText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  /* HEADER */
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerLeft: {
    flex: 1,
  },

  headerGreeting: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },

  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },

  locationName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 6,
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
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },

  /* SEARCH */
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: -11,
    marginBottom: 16,
    zIndex: 10,
  },

  searchWrapper: {
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
    marginLeft: 12,
  },

  clearButton: {
    padding: 4,
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
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },

  activeCategory: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
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
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },

  /* SHOP CARD */
  shopCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  offerBadge: {
    position: 'absolute',
    top: -6,
    right: 12,
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },

  offerText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  shopImagePlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  shopImageEmoji: {
    fontSize: 32,
  },

  shopInfo: {
    flex: 1,
    paddingTop: 2,
  },

  shopName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },

  ratingBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },

  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },

  separator: {
    marginHorizontal: 6,
    color: COLORS.divider,
    fontSize: 12,
  },

  locationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flex: 1,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  distanceTag: {
    backgroundColor: 'rgba(71, 85, 105, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },

  distanceText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  openTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },

  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.error,
    marginRight: 4,
  },

  openDot: {
    backgroundColor: COLORS.success,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.error,
  },

  openText: {
    color: COLORS.success,
  },

  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },

  matchIcon: {
    fontSize: 11,
    color: COLORS.success,
    marginRight: 4,
  },

  matchText: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '700',
  },

  productsPreview: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 5,
    fontStyle: 'italic',
  },

  mapButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
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

  emptyIcon: {
    marginBottom: 16,
    marginTop: 20,
  },

  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});