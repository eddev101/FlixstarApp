import React, { useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451';
const BLUE = '#434BE7';
const BG = '#141414';
const CARD_BG = '#1c2133';

export default function FavoritesScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => { fetchFavorites(); }, [])
  );

  async function fetchFavorites() {
    setLoading(true);
    try {
      const existing = await AsyncStorage.getItem('favorites');
      const favorites = existing ? JSON.parse(existing) : [];
      const fetched = await Promise.all(
        favorites.map(async item => {
          const url = item.type === 'movie'
            ? `https://api.themoviedb.org/3/movie/${item.id}?api_key=${API_KEY}`
            : `https://api.themoviedb.org/3/tv/${item.id}?api_key=${API_KEY}`;
          const res = await axios.get(url);
          return { ...res.data, type: item.type };
        })
      );
      setItems(fetched);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  }

  async function removeItem(id, type) {
    const existing = await AsyncStorage.getItem('favorites');
    let list = existing ? JSON.parse(existing) : [];
    list = list.filter(i => !(i.id === id.toString() && i.type === type));
    await AsyncStorage.setItem('favorites', JSON.stringify(list));
    fetchFavorites();
  }

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color={BLUE} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>❤️ My Favorites</Text>
      </View>
      {items.length === 0
        ? <View style={styles.empty}><Text style={styles.emptyText}>No favorites yet</Text></View>
        : <FlatList
          data={items}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const title = item.title || item.name;
            const year = (item.release_date || item.first_air_date || '').slice(0, 4);
            return (
              <TouchableOpacity
                style={styles.row}
                onPress={() => item.type === 'movie'
                  ? navigation.navigate('MovieDetail', { id: item.id })
                  : navigation.navigate('TVShowDetail', { id: item.id })}
              >
                <Image source={{ uri: `https://image.tmdb.org/t/p/w185${item.poster_path}` }} style={styles.img} />
                <View style={styles.info}>
                  <Text style={styles.title}>{title}</Text>
                  <Text style={styles.meta}>{year} · {item.type === 'movie' ? 'Movie' : 'TV Show'}</Text>
                  <Text style={styles.rating}>⭐ {item.vote_average?.toFixed(1)}</Text>
                </View>
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(item.id, item.type)}>
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 16, paddingBottom: 14 },
  backBtn: { backgroundColor: 'rgba(28,33,51,0.85)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 12 },
  backText: { color: '#fff', fontSize: 14 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#666', fontSize: 16 },
  row: { flexDirection: 'row', marginBottom: 14, backgroundColor: CARD_BG, borderRadius: 10, overflow: 'hidden' },
  img: { width: 70, height: 100, backgroundColor: '#0a0f1e' },
  info: { flex: 1, padding: 12, justifyContent: 'center' },
  title: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  meta: { color: '#888', fontSize: 13, marginBottom: 4 },
  rating: { color: '#FFC107', fontSize: 13 },
  removeBtn: { padding: 12, justifyContent: 'center' },
  removeText: { color: '#e50914', fontSize: 18 },
});