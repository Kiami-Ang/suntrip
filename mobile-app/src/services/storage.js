import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config';

export async function getToken() {
  return AsyncStorage.getItem(STORAGE_KEYS.token);
}

export async function getUser() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveSession({ token, user }) {
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.token, token],
    [STORAGE_KEYS.user, JSON.stringify(user)],
  ]);
}

export async function clearSession() {
  await AsyncStorage.multiRemove([STORAGE_KEYS.token, STORAGE_KEYS.user]);
}
