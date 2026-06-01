import React, { useState } from 'react';
import {
  View, Text, TextInput, FlatList, Image,
  TouchableOpacity, StyleSheet, ActivityIndicator
} from 'react-native';
import axios from 'axios';

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451';
const BLUE = '#434BE7';
const BG = '#141414';
const CARD_BG = '#1c2133';

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function doSearch(text) {
  setQuery(text);

  if (!text.trim()) {
    setResults([]);
    return;
  }

  setLoading(true);
    
  try {
    const res = await axios.get(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(text)}`)
    const results = res.data.results

    // Filter out adult content same way as collections
    const filtered = results.filter(item => {
      // Remove items marked as adult by TMDB
      if (item.adult === true) return false
      // Filter people known only for adult content
      if (item.media_type === 'person' && item.known_for_department === 'Adult') return false
      // Filter by title/name keywords
      const title = (item.title || item.name || '').toLowerCase()
      const nsfw = ['porn', 'xxx', 'anal', 'nude', 'hentai', 'erotic', 'explicit', 'nsfw', 'sex tape', 'hardcore']
      if (nsfw.some(word => title.includes(word))) return false
      return true
    })

    setResults(filtered)
  } catch (e) { console.log(e) }
  finally { setLoading(false) }
}

  function goToDetail(item) {
    if (item.media_type === 'movie') navigation.navigate('MovieDetail', { id: item.id });
    else if (item.media_type === 'tv') navigation.navigate('TVShowDetail', { id: item.id });
    else if (item.media_type === 'person') navigation.navigate('PersonDetail', { id: item.id });
  }

  function getImage(item) {
    const path = item.poster_path || item.profile_path;
    return path ? `https://image.tmdb.org/t/p/w185${path}` : 'https://via.placeholder.com/70x100';
  }

  function getLabel(item) {
    if (item.media_type === 'movie') return '🎬 Movie';
    if (item.media_type === 'tv') return '📺 TV Show';
    return '👤 Person';
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.input}
            placeholder="Search movies, shows, people..."
            placeholderTextColor="#555"
            value={query}
            onChangeText={(text) => {
            setQuery(text);
            doSearch(text);
          }}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading && <ActivityIndicator color={BLUE} style={{ marginTop: 20 }} />}

      {results.length === 0 && !loading && query.length > 1 && (
        <View style={styles.empty}><Text style={styles.emptyText}>No results found</Text></View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item, i) => `${item.id}-${i}`}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const title = item.title || item.name || 'Untitled';
          const year = (item.release_date || item.first_air_date || '').slice(0, 4);
          return (
            <TouchableOpacity style={styles.resultRow} onPress={() => goToDetail(item)}>
              <Image source={{ uri: getImage(item) }} style={[styles.resultImg, item.media_type === 'person' && styles.personImg]} />
              <View style={styles.resultInfo}>
                <Text style={styles.resultTitle}>{title}</Text>
                <View style={styles.resultMeta}>
                  <Text style={styles.resultLabel}>{getLabel(item)}</Text>
                  {year ? <Text style={styles.resultYear}>{year}</Text> : null}
                </View>
                {item.vote_average > 0 && <Text style={styles.resultRating}>⭐ {item.vote_average?.toFixed(1)}</Text>}
                {item.known_for_department && <Text style={styles.resultDept}>Known for {item.known_for_department}</Text>}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { paddingTop: 52, paddingHorizontal: 16, paddingBottom: 14 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 12 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD_BG, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: '#2a3050' },
  searchIcon: { fontSize: 15, marginRight: 8 },
  input: { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 13 },
  clearBtn: { color: '#666', fontSize: 16, paddingLeft: 8 },
  empty: { flex: 1, alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#555', fontSize: 15 },
  resultRow: { flexDirection: 'row', marginBottom: 14, backgroundColor: CARD_BG, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#2a3050' },
  resultImg: { width: 70, height: 100, backgroundColor: '#0a0f1e' },
  personImg: { borderRadius: 0 },
  resultInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  resultTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 5 },
  resultMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  resultLabel: { color: BLUE, fontSize: 12, fontWeight: '600' },
  resultYear: { color: '#666', fontSize: 12 },
  resultRating: { color: '#FFC107', fontSize: 12 },
  resultDept: { color: '#888', fontSize: 12 },
});
