import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  Animated,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

export default function PlayScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [spinning, setSpinning] = useState(false);
  const [reward, setReward] = useState(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const rewards = [
    { id: 1, name: '10% OFF', icon: 'pricetag', color: '#3B82F6' },
    { id: 2, name: 'Free Item', icon: 'gift', color: '#10B981' },
    { id: 3, name: '$5 Voucher', icon: 'card', color: '#F59E0B' },
    { id: 4, name: 'Free Shipping', icon: 'rocket', color: '#8B5CF6' },
  ];

  const spinWheel = () => {
    if (spinning) return;

    setSpinning(true);
    setReward(null);

    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
    const randomRotation = Math.random() * 360 + 720;

    Animated.timing(rotateAnim, {
      toValue: randomRotation,
      duration: 3000,
      useNativeDriver: true,
    }).start(() => {
      setReward(randomReward);
      setSpinning(false);
    });
  };

  const videos = [
    {
      id: 1,
      title: 'Shop Smart Tips',
      duration: '2:30',
      rewards: '50 pts',
      icon: 'school',
    },
    {
      id: 2,
      title: 'Product Reviews',
      duration: '3:45',
      rewards: '75 pts',
      icon: 'star',
    },
    {
      id: 3,
      title: 'Fashion Guide',
      duration: '4:20',
      rewards: '100 pts',
      icon: 'sparkles',
    },
  ];

  const spin = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* HEADER */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View>
          <Text style={styles.headerTitle}>Play & Win</Text>
          <Text style={styles.headerSubtitle}>Earn rewards daily</Text>
        </View>
        <View style={styles.badge}>
          <Icon name="game-controller" size={20} color="#FFF" />
        </View>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* SPIN SECTION */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Daily Spin Wheel</Text>
          <Text style={styles.sectionDescription}>
            Spin once daily for a chance to win exciting rewards
          </Text>

          <View style={styles.spinContainer}>
            <Animated.View
              style={[
                styles.wheelContainer,
                {
                  transform: [{ rotate: spin }],
                },
              ]}
            >
              <LinearGradient
                colors={['#3B82F6', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.wheel}
              >
                <Icon name="disc" size={120} color="rgba(255,255,255,0.3)" />
                <Text style={styles.wheelNumber}>1</Text>
              </LinearGradient>
            </Animated.View>

            <View style={styles.wheelPin} />
          </View>

          <TouchableOpacity
            onPress={spinWheel}
            disabled={spinning}
            style={[styles.spinButton, spinning && styles.spinButtonDisabled]}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.gradient2]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.spinButtonGradient}
            >
              <Icon
                name={spinning ? 'hourglass' : 'play'}
                size={20}
                color="#FFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.spinButtonText}>
                {spinning ? 'SPINNING...' : 'SPIN NOW'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {reward && (
            <Animated.View style={[styles.rewardCard, { opacity: fadeAnim }]}>
              <View style={[styles.rewardIcon, { backgroundColor: reward.color }]}>
                <Icon name={reward.icon} size={32} color="#FFF" />
              </View>
              <Text style={styles.rewardText}>You Won!</Text>
              <Text style={styles.rewardValue}>{reward.name}</Text>
              <Text style={styles.rewardSmall}>Claim within 24 hours</Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* VIDEO REWARDS */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Watch & Earn</Text>
          <Text style={styles.sectionDescription}>
            Watch short videos to earn reward points
          </Text>

          {videos.map((video) => (
            <TouchableOpacity key={video.id} style={styles.videoCard}>
              <View style={styles.videoThumbnail}>
                <Icon name={video.icon} size={32} color={COLORS.primary} />
              </View>
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle}>{video.title}</Text>
                <Text style={styles.videoDuration}>{video.duration}</Text>
              </View>
              <View style={styles.videoReward}>
                <Icon name="star" size={16} color="#F59E0B" />
                <Text style={styles.videoRewardText}>{video.rewards}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* STATS */}
        <Animated.View style={[styles.section, styles.statsSection, { opacity: fadeAnim }]}>
          <View style={styles.statCard}>
            <Icon name="gift" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>1,250</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="flame" size={24} color="#F59E0B" />
            <Text style={styles.statValue}>7</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="trophy" size={24} color="#D946EF" />
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Rewards Won</Text>
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
    marginBottom: 4,
  },

  sectionDescription: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 16,
  },

  spinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    position: 'relative',
  },

  wheelContainer: {
    width: 200,
    height: 200,
  },

  wheel: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },

  wheelNumber: {
    position: 'absolute',
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
  },

  wheelPin: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    top: 8,
    left: '50%',
    marginLeft: -6,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  spinButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },

  spinButtonDisabled: {
    opacity: 0.6,
  },

  spinButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  spinButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  rewardCard: {
    marginTop: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  rewardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  rewardText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },

  rewardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    marginVertical: 4,
  },

  rewardSmall: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  videoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  videoThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  videoInfo: {
    flex: 1,
  },

  videoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },

  videoDuration: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  videoReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  videoRewardText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.warning,
    marginLeft: 4,
  },

  statsSection: {
    paddingBottom: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  statCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    flex: 1,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    marginVertical: 4,
  },

  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
