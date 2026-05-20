import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Modal, ScrollView
} from 'react-native';
import axios from 'axios';

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451';
const BLUE = '#434BE7';
const BG = '#141414';
const CARD_BG = '#1c2133';
const REGION = 'US';

const SORT_OPTIONS = [
  { label: 'Popularity', value: 'popularity.desc' },
  { label: 'Rating', value: 'vote_average.desc' },
  { label: 'Newest', value: 'primary_release_date.desc' },
  { label: 'Oldest', value: 'primary_release_date.asc' },
  { label: 'Title A-Z', value: 'original_title.asc' },
];

const PROVIDERS = [
  { label: 'Any', value: '' },

  // Major streaming platforms
  { label: 'Netflix', value: '8' },
  { label: 'Amazon Prime Video', value: '119' },
  { label: 'Disney+', value: '337' },
  { label: 'Apple TV+', value: '350' },
  { label: 'Paramount+', value: '531' },
  { label: 'Peacock', value: '387' },
  { label: 'Hulu', value: '453' },
  { label: 'Max', value: '318' },
  { label: 'Crunchyroll', value: '283' },

  // Additional providers (kids / family / free / niche)
  { label: 'Amazon Video', value: '9' },
  { label: 'Nickelodeon', value: '13' },
  { label: 'YouTube', value: '15' },
  { label: 'Tubi TV', value: '73' },
  { label: 'Discovery+', value: '207' },
  { label: 'Pluto TV', value: '444' }
];

const COUNTRIES = [
  { label: 'Any', value: '' },

  // Europe
  { label: 'Germany', value: 'DE' },
  { label: 'Spain', value: 'ES' },
  { label: 'Italy', value: 'IT' },

  // North America
  { label: 'Canada', value: 'CA' },

  // Oceania
  { label: 'Australia', value: 'AU' },

  // Latin America
  { label: 'Brazil', value: 'BR' },
  { label: 'Mexico', value: 'MX' },
  { label: 'Argentina', value: 'AR' },
  { label: 'Chile', value: 'CL' },

  // Middle East
  { label: 'United Arab Emirates', value: 'AE' },
  { label: 'Saudi Arabia', value: 'SA' },

  // Africa
  { label: 'Tanzania', value: 'TZ' },
  { label: 'South Africa', value: 'ZA' },
  { label: 'Nigeria', value: 'NG' },
  { label: 'Egypt', value: 'EG' },
  { label: 'Kenya', value: 'KE' },
  { label: 'Ghana', value: 'GH' },
  { label: 'Morocco', value: 'MA' },
  { label: 'Algeria', value: 'DZ' },
  { label: 'Ethiopia', value: 'ET' },

  // Asia
  { label: 'Indonesia', value: 'ID' },
  { label: 'Philippines', value: 'PH' },
  { label: 'Thailand', value: 'TH' }
]

const RATINGS = [
  { label: 'Any', value: '0' },
  { label: '6+', value: '6' },
  { label: '7+', value: '7' },
  { label: '8+', value: '8' },
  { label: '9+', value: '9' },
];

const currentYear = new Date().getFullYear();
const YEARS = [{ label: 'Any', value: '' }, ...Array.from({ length: currentYear - 1949 }, (_, i) => {
  const y = currentYear - i;
  return { label: String(y), value: String(y) };
})];

export default function MoviesScreen({ navigation }) {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    genre: '', year: '', sort: 'popularity.desc',
    provider: '', country: '', rating: '0',
  });
  const [activeFilters, setActiveFilters] = useState({ ...filters });

  useEffect(() => { fetchGenres(); fetchMovies(1, activeFilters); }, []);

  async function fetchGenres() {
    try {
      const res = await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`);
      setGenres([{ id: '', name: 'Any' }, ...res.data.genres]);
    } catch (e) { console.log(e); }
  }

  async function fetchMovies(p, f) {
    try {
      let url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&page=${p}`;
      if (f.genre) url += `&with_genres=${f.genre}`;
      if (f.year) url += `&primary_release_year=${f.year}`;
      if (f.provider) url += `&watch_region=${REGION}&with_watch_providers=${f.provider}`;
      if (f.country) url += `&with_origin_country=${f.country}`;
      if (f.rating !== '0') url += `&vote_average.gte=${f.rating}`;
      url += `&sort_by=${f.sort}`;
      const res = await axios.get(url);
      if (p === 1) setMovies(res.data.results);
      else setMovies(prev => [...prev, ...res.data.results]);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setLoadingMore(false); }
  }

  function applyFilters() {
    setShowFilters(false);
    setLoading(true);
    setPage(1);
    setActiveFilters({ ...filters });
    fetchMovies(1, filters);
  }

  function resetFilters() {
    const def = { genre: '', year: '', sort: 'popularity.desc', provider: '', country: '', rating: '0' };
    setFilters(def);
    setActiveFilters(def);
    setShowFilters(false);
    setLoading(true);
    setPage(1);
    fetchMovies(1, def);
  }

  function loadMore() {
    const next = page + 1;
    setPage(next); setLoadingMore(true);
    fetchMovies(next, activeFilters);
  }

  function FilterRow({ label, options, field }) {
    return (
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>{label}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {options.map(opt => (
            <TouchableOpacity
              key={opt.value ?? opt.id}
              style={[styles.filterChip, filters[field] === (opt.value ?? String(opt.id)) && styles.filterChipActive]}
              onPress={() => setFilters(f => ({ ...f, [field]: opt.value ?? String(opt.id) }))}
            >
              <Text style={[styles.filterChipText, filters[field] === (opt.value ?? String(opt.id)) && styles.filterChipTextActive]}>
                {opt.label ?? opt.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  const activeCount = Object.entries(activeFilters).filter(([k, v]) =>
    k === 'sort' ? v !== 'popularity.desc' : v !== '' && v !== '0'
  ).length;

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color={BLUE} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Movies</Text>
        <TouchableOpacity style={[styles.filterBtn, activeCount > 0 && styles.filterBtnActive]} onPress={() => setShowFilters(true)}>
          <Text style={styles.filterBtnText}>⚙ Filters{activeCount > 0 ? ` (${activeCount})` : ''}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={movies}
        numColumns={3}
        keyExtractor={(item, i) => `${item.id}-${i}`}
        contentContainerStyle={{ padding: 8 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator color={BLUE} style={{ margin: 16 }} /> : null}
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

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Movies</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <FilterRow label="Genre" options={genres.map(g => ({ label: g.name, value: String(g.id) }))} field="genre" />
              <FilterRow label="Sort By" options={SORT_OPTIONS} field="sort" />
              <FilterRow label="Year" options={YEARS} field="year" />
              <FilterRow label="Provider" options={PROVIDERS} field="provider" />
              <FilterRow label="Country" options={COUNTRIES} field="country" />
              <FilterRow label="Min Rating" options={RATINGS} field="rating" />
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
                <Text style={styles.resetBtnText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
                <Text style={styles.applyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: 16, paddingBottom: 14 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  filterBtn: { backgroundColor: CARD_BG, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#2a3050' },
  filterBtnActive: { backgroundColor: BLUE, borderColor: BLUE },
  filterBtnText: { color: '#fff', fontSize: 13 },
  card: { flex: 1, margin: 4 },
  cardHead: { position: 'relative' },
  cardImg: { width: '100%', aspectRatio: 2 / 3, borderRadius: 8, backgroundColor: CARD_BG },
  ratingBadge: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(28,33,51,0.9)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5 },
  ratingText: { color: '#FFC107', fontSize: 9 },
  cardTitle: { color: '#fff', fontSize: 11, marginTop: 4 },
  cardYear: { color: '#888', fontSize: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1a1a2e', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  modalClose: { color: '#888', fontSize: 20 },
  filterGroup: { marginBottom: 18, paddingHorizontal: 16 },
  filterLabel: { color: BLUE, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  filterChip: { backgroundColor: CARD_BG, paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#2a3050' },
  filterChipActive: { backgroundColor: BLUE, borderColor: BLUE },
  filterChipText: { color: '#888', fontSize: 13 },
  filterChipTextActive: { color: '#fff', fontWeight: '700' },
  modalActions: { flexDirection: 'row', padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: '#2a3050' },
  resetBtn: { flex: 1, backgroundColor: CARD_BG, padding: 14, borderRadius: 10, alignItems: 'center' },
  resetBtnText: { color: '#fff', fontSize: 15 },
  applyBtn: { flex: 2, backgroundColor: BLUE, padding: 14, borderRadius: 10, alignItems: 'center' },
  applyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});