import { NativeModules, Platform } from 'react-native';

const getDevServerHost = () => {
  const scriptURL = NativeModules?.SourceCode?.scriptURL;
  if (typeof scriptURL !== 'string') {
    return null;
  }

  const match = scriptURL.match(/^https?:\/\/([^/:]+)/);
  return match?.[1] || null;
};

const resolveApiBaseUrl = () => {
  const devServerHost = getDevServerHost();
  if (devServerHost) {
    return `http://${devServerHost}:5000`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  return 'http://localhost:5000';
};

export const API_BASE_URL = resolveApiBaseUrl();

export const API_ENDPOINTS = {
  AUTH_ME: '/api/auth/me',
  AUTH_PROFILE: '/api/auth/profile',
  SHOPS: '/api/shops',
  SHOPS_MY: '/api/shops/my',
  SHOPS_UPDATE: '/api/shops/update',
  SHOPS_TIMINGS: '/api/shops/timings',
  SHOPS_TOGGLE_OPEN: '/api/shops/toggle-open',
  PRODUCTS_SHOP: (shopId) => `/api/products/shop/${shopId}`,
  PRODUCTS_OFFER: (productId) => `/api/products/${productId}/offer`,
  PRODUCTS: (productId) => `/api/products/${productId}`,
  LOCATION_REVERSE: '/api/location/reverse',
};
