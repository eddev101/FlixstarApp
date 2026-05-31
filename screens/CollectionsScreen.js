import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput
} from 'react-native';
import axios from 'axios';

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451';
const BLUE = '#434BE7';
const BG = '#141414';
const CARD_BG = '#1c2133';

const COLLECTION_IDS = [1241, 86311, 448150, 10, 263, 119, 121938, 295, 328, 531241, 748, 2344, 645, 8651, 9485, 87096, 528, 324552, 131635, 268, 137697, 87, 210511, 10194, 230, 36694, 152495, 8091, 261694, 8350];

export default function CollectionsScreen({ navigation }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => { loadPredefined(); }, []);

  async function loadPredefined() {
    setLoading(true);
    try {
      const results = await Promise.all(
        COLLECTION_IDS.map(id =>
          axios.get(`https://api.themoviedb.org/3/collection/${id}?api_key=${API_KEY}&language=en-US`)
            .then(r => r.data).catch(() => null)
        )
      );
      setCollections(results.filter(Boolean));
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  }

  async function searchCollections(e) {
  e.preventDefault()
  if (!query.trim()) { loadCollections(); return }
  setLoading(true)
  try {
    const res = await axios.get(`https://api.themoviedb.org/3/search/collection?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}`)
    const collections = res.data.results

    // Check each collection's parts for adult content — same as your original site
    const filtered = await Promise.all(
      collections.map(async c => {
        try {
          const details = await axios.get(`https://api.themoviedb.org/3/collection/${c.id}?api_key=${API_KEY}&language=en-US`)
          const nonAdult = details.data.parts.filter(movie => !movie.adult)
          return nonAdult.length > 0 ? c : null
        } catch { return null }
      })
    )
    setCollections(filtered.filter(Boolean))
  } catch (e) { console.log(e) }
  finally { setLoading(false) }
}

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color={BLUE} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Collections</Text>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search collections..."
          placeholderTextColor="#555"
          value={query}
          onChangeText={searchCollections}
          autoCorrect={false}
        />
      </View>

      {searching && <ActivityIndicator color={BLUE} style={{ margin: 10 }} />}

      <FlatList
        data={collections}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.collectionRow}
            onPress={() => navigation.navigate('CollectionDetail', { id: item.id })}
          >
            <Image
              source={{ uri: item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : 'https://via.placeholder.com/80x120' }}
              style={styles.collectionImg}
            />
            <View style={styles.collectionInfo}>
              <Text style={styles.collectionName}>{item.name}</Text>
              <Text style={styles.collectionMeta}>Movie Collection</Text>
              {item.parts && <Text style={styles.collectionParts}>{item.parts.length} movies</Text>}
            </View>
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
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD_BG, borderRadius: 12, marginHorizontal: 16, paddingHorizontal: 14, borderWidth: 1, borderColor: '#2a3050', marginBottom: 10 },
  searchIcon: { fontSize: 15, marginRight: 8 },
  input: { flex: 1, color: '#fff', fontSize: 14, paddingVertical: 12 },
  collectionRow: { flexDirection: 'row', backgroundColor: CARD_BG, borderRadius: 12, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#2a3050' },
  collectionImg: { width: 80, height: 115, backgroundColor: '#0a0f1e' },
  collectionInfo: { flex: 1, padding: 14, justifyContent: 'center' },
  collectionName: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 6 },
  collectionMeta: { color: BLUE, fontSize: 12, marginBottom: 4 },
  collectionParts: { color: '#888', fontSize: 12 },
});
