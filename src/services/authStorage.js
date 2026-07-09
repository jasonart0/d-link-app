import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'd-link.auth.token';
const USER_KEY = 'd-link.auth.user';

const secureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED,
};

const isWeb = Platform.OS === 'web';

const storage = {
  async getItem(key) {
    if (isWeb) {
      return globalThis.localStorage?.getItem(key) ?? null;
    }

    return SecureStore.getItemAsync(key);
  },

  async setItem(key, value, options) {
    if (isWeb) {
      globalThis.localStorage?.setItem(key, value);
      return;
    }

    await SecureStore.setItemAsync(key, value, options);
  },

  async removeItem(key) {
    if (isWeb) {
      globalThis.localStorage?.removeItem(key);
      return;
    }

    await SecureStore.deleteItemAsync(key);
  },
};

export const authStorage = {
  async getSession() {
    const [token, userJson] = await Promise.all([
      storage.getItem(TOKEN_KEY),
      storage.getItem(USER_KEY),
    ]);

    return {
      token,
      user: userJson ? JSON.parse(userJson) : null,
    };
  },

  async saveSession({ token, user }) {
    await storage.setItem(TOKEN_KEY, token, secureStoreOptions);

    if (user) {
      await storage.setItem(USER_KEY, JSON.stringify(user), secureStoreOptions);
    }
  },

  async clearSession() {
    await Promise.all([storage.removeItem(TOKEN_KEY), storage.removeItem(USER_KEY)]);
  },
};

export default authStorage;
