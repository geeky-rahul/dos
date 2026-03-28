import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/colors';

const LoadingSpinner = ({ message = "Loading...", size = "large", color = COLORS.primary }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
});

export default LoadingSpinner;