import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS = '@suntrip/accessToken';
const REFRESH = '@suntrip/refreshToken';
const USER = '@suntrip/user';

export const storage = {
  async setTokens(access, refresh) {
    const pairs = [[ACCESS, access]];
    if (refresh) pairs.push([REFRESH, refresh]);
    await AsyncStorage.multiSet(pairs);
  },
  getAccessToken: () => AsyncStorage.getItem(ACCESS),
  getRefreshToken: () => AsyncStorage.getItem(REFRESH),

  async setUser(user) {
    await AsyncStorage.setItem(USER, JSON.stringify(user));
  },
  async getUser() {
    const raw = await AsyncStorage.getItem(USER);
    return raw ? JSON.parse(raw) : null;
  },

  async clear() {
    await AsyncStorage.multiRemove([ACCESS, REFRESH, USER]);
  },
};

export default storage;
