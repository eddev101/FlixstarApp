import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, ImageBackground
} from 'react-native';
import axios from 'axios';

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451';
const BLUE = '#434BE7';
const BG = '#141414';

export default function GenresScreen({ navigation }) {
  const [movieGenres, setMovieGenres] = useState([]);
  const [tvGenres, setTvGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('movie');

  useEffect(() => { fetchGenres(); }, []);

  async function fetchGenres() {
    try {
      const [mg, tg] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`),
        axios.get(`https://api.themoviedb.org/3/genre/tv/list?api_key=${API_KEY}`),
      ]);

      const withBg = async (genres, type) => Promise.all(
        genres.map(async g => {
          try {
            const res = await axios.get(`https://api.themoviedb.org/3/discover/${type}?api_key=${API_KEY}&with_genres=${g.id}&sort_by=popularity.desc`);
            const first = res.data.results[0];
            return { ...g, backdrop: first?.backdrop_path ? `https://image.tmdb.org/t/p/w500${first.backdrop_path}` : null };
          } catch { return { ...g, backdrop: null }; }
        })
      );

      const [mgBg, tgBg] = await Promise.all([
        withBg(mg.data.genres, 'movie'),
        withBg(tg.data.genres, 'tv'),
      ]);
      setMovieGenres(mgBg);
      setTvGenres(tgBg);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  }

  const data = tab === 'movie' ? movieGenres : tvGenres;

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color={BLUE} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Genres</Text>
      </View>
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'movie' && styles.tabActive]} onPress={() => setTab('movie')}>
          <Text style={[styles.tabText, tab === 'movie' && styles.tabTextActive]}>Movies</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'tv' && styles.tabActive]} onPress={() => setTab('tv')}>
          <Text style={[styles.tabText, tab === 'tv' && styles.tabTextActive]}>TV Shows</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.genreCard}
            onPress={() => navigation.navigate('GenreDetail', { id: item.id, name: item.name, type: tab })}
          >
            <ImageBackground
              source={{ uri: item.backdrop }}
              style={styles.genreBg}
              imageStyle={{ borderRadius: 12 }}
            >
              <View style={styles.genreOverlay}>
                <Text style={styles.genreName}>{item.name}</Text>
                <Text style={styles.genreViewBtn}>View {tab === 'movie' ? 'Movies' : 'TV Shows'} →</Text>
              </View>
            </ImageBackground>
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
  tabs: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 10, gap: 10 },
  tab: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#1c2133', borderWidth: 1, borderColor: '#2a3050' },
  tabActive: { backgroundColor: BLUE, borderColor: BLUE },
  tabText: { color: '#888', fontSize: 14 },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  genreCard: { flex: 1, margin: 6, height: 120 },
  genreBg: { flex: 1, height: 120, justifyContent: 'flex-end', borderRadius: 12, overflow: 'hidden', backgroundColor: '#1c2133' },
  genreOverlay: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 12, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  genreName: { color: '#fff', fontSize: 15, fontWeight: '700' },
  genreViewBtn: { color: BLUE, fontSize: 11, marginTop: 3 },
});