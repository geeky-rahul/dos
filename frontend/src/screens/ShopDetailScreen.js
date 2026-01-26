import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';

export default function ShopDetailScreen({ route }) {
  const { shop } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.shopName}>{shop.name}</Text>
          <Text style={styles.rating}>⭐ {shop.rating}</Text>

          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => Linking.openURL(shop.mapUrl)}
          >
            <Text style={styles.mapText}>📍 View on Google Maps</Text>
          </TouchableOpacity>
        </View>

        {/* NOTICE */}
        {shop.notice && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{shop.notice}</Text>
          </View>
        )}

        {/* OFFERS */}
        {shop.offers?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Deals</Text>
            {shop.offers.map((offer, index) => (
              <Text key={index} style={styles.offerItem}>
                • {offer}
              </Text>
            ))}
          </View>
        )}

        {/* PRODUCTS */}
        {shop.products?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Products</Text>
            {shop.products.map((item) => (
              <View key={item.id} style={styles.productRow}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>{item.price}</Text>
              </View>
            ))}
          </View>
        )}

        {/* CONTACT */}
        {shop.contact && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <Text style={styles.contactText}>📞 {shop.contact.phone}</Text>
            <Text style={styles.contactText}>📍 {shop.contact.address}</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
  },

  shopName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },

  rating: {
    color: '#ffe0c7',
    marginTop: 4,
  },

  mapBtn: {
    marginTop: 12,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  mapText: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  notice: {
    backgroundColor: '#fff3cd',
    margin: 16,
    padding: 14,
    borderRadius: 10,
  },

  noticeText: {
    color: '#856404',
    fontWeight: '600',
  },

  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },

  offerItem: {
    fontSize: 14,
    marginBottom: 6,
  },

  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
  },

  productName: {
    fontSize: 14,
  },

  productPrice: {
    fontSize: 14,
    fontWeight: '600',
  },

  contactText: {
    fontSize: 14,
    marginBottom: 6,
  },
});
