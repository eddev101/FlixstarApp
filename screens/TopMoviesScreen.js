import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import axios from 'axios';

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451';
const BLUE = '#434BE7';
const BG = '#141414';
const CARD_BG = '#1c2133';

export default function TopMoviesScreen({ navigation }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => { fetchMovies(1); }, []);

  async function fetchMovies(p) {
    try {
      const res = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&sort_by=vote_average.desc&vote_count.gte=100&page=${p}`
      );
      if (p === 1) setMovies(res.data.results);
      else setMovies(prev => [...prev, ...res.data.results]);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setLoadingMore(false); }
  }

  function loadMore() {
    const next = page + 1; setPage(next); setLoadingMore(true); fetchMovies(next);
  }

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color={BLUE} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏆 Top Movies</Text>
      </View>
      <FlatList
        data={movies}
        numColumns={3}
        keyExtractor={(item, i) => `${item.id}-${i}`}
        contentContainerStyle={{ padding: 8 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator color={BLUE} /> : null}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MovieDetail', { id: item.id })}>
            <View style={styles.cardHead}>
              <Image source={{ uri: `https://image.tmdb.org/t/p/w342${item.poster_path}` }} style={styles.cardImg} />
              <View style={styles.ratingBadge}><Text style={styles.ratingText}>⭐ {item.vote_average?.toFixed(1)}</Text></View>
            </View>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardYear}>{item.release_date?.slice(0, 4)}</Text>
          </TouchableOpacity>
        )}
      />
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
  card: { flex: 1, margin: 4 },
  cardHead: { position: 'relative' },
  cardImg: { width: '100%', aspectRatio: 2 / 3, borderRadius: 8, backgroundColor: CARD_BG },
  ratingBadge: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(28,33,51,0.9)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5 },
  ratingText: { color: '#FFC107', fontSize: 9 },
  cardTitle: { color: '#fff', fontSize: 11, marginTop: 4 },
  cardYear: { color: '#888', fontSize: 10 },
});