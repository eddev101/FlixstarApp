import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'continueWatching';
const MAX = 10;

export async function saveMovieContinueWatching(id) {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    let list = raw ? JSON.parse(raw) : [];
    list = list.filter(i => !(String(i.id) === String(id) && i.type === 'movie'));
    list.unshift({ id: String(id), type: 'movie', updatedAt: Date.now() });
    await AsyncStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch (e) { console.log(e); }
}

export async function saveTVContinueWatching(id, season, episode) {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    let list = raw ? JSON.parse(raw) : [];
    list = list.filter(i => !(String(i.id) === String(id) && i.type === 'tv'));
    list.unshift({ id: String(id), type: 'tv', season, episode, updatedAt: Date.now() });
    await AsyncStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch (e) { console.log(e); }
}

export async function getContinueWatching() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

export async function removeFromContinueWatching(id, type) {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    let list = raw ? JSON.parse(raw) : [];
    list = list.filter(i => !(String(i.id) === String(id) && i.type === type));
    await AsyncStorage.setItem(KEY, JSON.stringify(list));
  } catch (e) { console.log(e); }
}