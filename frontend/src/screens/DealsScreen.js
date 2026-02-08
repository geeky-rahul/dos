import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  Animated,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../constants/colors';

export default function DealsScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const deals = [
    {
      id: 1,
      shop: 'Tech Store Pro',
      discount: 40,
      category: 'Electronics',
      icon: 'phone-portrait',
      color: '#3B82F6',
    },
    {
      id: 2,
      shop: 'Fashion Hub',
      discount: 50,
      category: 'Clothing',
      icon: 'shirt',
      color: '#EC4899',
    },
    {
      id: 3,
      shop: 'Food Court',
      discount: 35,
      category: 'Food',
      icon: 'restaurant',
      color: '#F97316',
    },
    {
      id: 4,
      shop: 'Hardware World',
      discount: 25,
      category: 'Tools',
      icon: 'hammer',
      color: '#8B5CF6',
    },
    {
      id: 5,
      shop: 'Book Store',
      discount: 30,
      category: 'Books',
      icon: 'book',
      color: '#06B6D4',
    },
    {
      id: 6,
      shop: 'Beauty Salon',
      discount: 45,
      category: 'Beauty',
      icon: 'sparkles',
      color: '#D946EF',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* HEADER */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View>
          <Text style={styles.headerTitle}>Top Deals</Text>
          <Text style={styles.headerSubtitle}>Limited time offers</Text>
        </View>
        <View style={styles.badge}>
          <Icon name="flash" size={20} color="#FFF" />
        </View>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* FEATURED DEALS */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Trending Now</Text>
          
          {deals.slice(0, 3).map((deal) => (
            <LinearGradient
              key={deal.id}
              colors={[deal.color, deal.color + '80']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.dealCard}
            >
              <View style={styles.dealContent}>
                <View style={styles.dealIconContainer}>
                  <Icon name={deal.icon} size={32} color="#FFF" />
                </View>
                <View style={styles.dealInfo}>
                  <Text style={styles.shopName}>{deal.shop}</Text>
                  <Text style={styles.category}>{deal.category}</Text>
                </View>
              </View>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{deal.discount}%</Text>
                <Text style={styles.offText}>OFF</Text>
              </View>
            </LinearGradient>
          ))}
        </Animated.View>

        {/* OTHER DEALS */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>More Deals</Text>
          <View style={styles.dealsGrid}>
            {deals.slice(3).map((deal) => (
              <View key={deal.id} style={styles.gridCard}>
                <LinearGradient
                  colors={[deal.color + '20', deal.color + '10']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gridCardInner}
                >
                  <Icon
                    name={deal.icon}
                    size={32}
                    color={deal.color}
                    style={styles.gridIcon}
                  />
                  <Text style={styles.gridDiscount}>{deal.discount}%</Text>
                  <Text style={styles.gridShop}>{deal.shop}</Text>
                </LinearGradient>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* INFO SECTION */}
        <Animated.View style={[styles.section, styles.infoSection, { opacity: fadeAnim }]}>
          <View style={styles.infoCard}>
            <Icon name="information-circle" size={24} color={COLORS.primary} />
            <Text style={styles.infoText}>
              Offers are updated daily. Check back regularly for new deals!
            </Text>
          </View>
        </Animated.View>
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
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },

  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },

  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },

  dealCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  dealContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  dealIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  dealInfo: {
    flex: 1,
  },

  shopName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },

  category: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },

  discountBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },

  discountText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },

  offText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
  },

  dealsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  gridCard: {
    width: '48%',
    aspectRatio: 1,
  },

  gridCardInner: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },

  gridIcon: {
    marginBottom: 8,
  },

  gridDiscount: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },

  gridShop: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },

  infoSection: {
    paddingBottom: 32,
  },

  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
});
