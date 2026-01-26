import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Linking,
  TextInput,
} from 'react-native';

import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';

export default function HomeScreen({ navigation }) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  // 📡 FETCH SHOPS FROM BACKEND
  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const res = await fetch('http://10.0.2.2:5000/api/shops');
      const data = await res.json();

      // ✅ backend response safety
      setShops(data.shops || []);
    } catch (err) {
      console.log('Error fetching shops:', err);
    } finally {
      setLoading(false);
    }
  };

  const openMaps = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  // 🔍 SEARCH (SHOP NAME + PRODUCT NAME)
  const filteredShops = shops.filter((shop) => {
    if (query.trim() === '') return true;

    const q = query.toLowerCase();

    const shopMatch = shop.name?.toLowerCase().includes(q);

    const productMatch = shop.products?.some((product) =>
      product.name?.toLowerCase().includes(q)
    );

    return shopMatch || productMatch;
  });

  const renderShop = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('ShopDetail', { shop: item })}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>

        <Text style={styles.sub}>
          ⭐ {item.rating} • {item.area}, {item.city}
        </Text>

        {/* PRODUCT MATCH INFO */}
        {query &&
          item.products?.some((p) =>
            p.name?.toLowerCase().includes(query.toLowerCase())
          ) && (
            <Text style={styles.matchText}>
              Matching product available
            </Text>
          )}
      </View>

      <TouchableOpacity
        style={styles.mapBtn}
        onPress={() => openMaps(item.mapUrl)}
      >
        <Text style={styles.mapText}>📍 Maps</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // ⏳ LOADING STATE
  if (loading) {
    return (
      <View style={styles.loader}>
        <Text>Loading shops...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📍 Rental ▼</Text>
          <Text style={styles.headerSub}>
            Discover local shops around you
          </Text>
        </View>

        <TouchableOpacity
          style={styles.profileCircle}
          onPress={() => navigation.navigate('Account')}
        >
          <Text style={{ fontSize: 16 }}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <View style={styles.searchWrapper}>
        <TextInput
          placeholder="Search shops or products"
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>

      {/* SHOP LIST */}
      <FlatList
        data={filteredShops}
        keyExtractor={(item) => item._id}
        renderItem={renderShop}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListHeaderComponent={() => (
          <Text style={styles.sectionTitle}>
            {query ? `Results for "${query}"` : 'Shops near you'}
          </Text>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* HEADER */
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  headerSub: {
    color: '#ffe0c7',
    fontSize: 12,
    marginTop: 4,
  },

  profileCircle: {
    backgroundColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* SEARCH */
  searchWrapper: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    borderRadius: 10,
    elevation: 3,
  },

  searchInput: {
    height: 46,
    fontSize: 14,
    color: '#000',
  },

  /* SECTION TITLE */
  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 6,
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },

  /* SHOP CARD */
  card: {
    backgroundColor: '#f2f2f2',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  name: {
    fontSize: 16,
    fontWeight: '600',
  },

  sub: {
    marginTop: 4,
    fontSize: 13,
    color: '#555',
  },

  matchText: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },

  mapBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },

  mapText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
