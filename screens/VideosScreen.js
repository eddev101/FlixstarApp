import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput, Modal, ScrollView
} from 'react-native';
import { Linking } from 'react-native';
import axios from 'axios';

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451';
const BLUE = '#434BE7';
const BG = '#141414';
const CARD_BG = '#1c2133';

export default function VideosScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [trailers, setTrailers] = useState([]);
  const [activeTrailer, setActiveTrailer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingTrailers, setLoadingTrailers] = useState(false);

  useEffect(() => { fetchVideos(1, ''); }, []);

  async function fetchVideos(p, q) {
    setLoading(true);
    try {
      const url = q
        ? `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(q)}&page=${p}`
        : `https://api.themoviedb.org/3/trending/all/day?api_key=${API_KEY}&page=${p}`;
      const res = await axios.get(url);
      const filtered = res.data.results.filter(r => r.media_type === 'movie' || r.media_type === 'tv');
      setItems(filtered);
      setTotalPages(res.data.total_pages);
      setPage(p);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  }

  async function openTrailers(id, type) {
    setLoadingTrailers(true);
    setShowModal(true);
    try {
      const url = type === 'movie'
        ? `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`
        : `https://api.themoviedb.org/3/tv/${id}/videos?api_key=${API_KEY}`;
      const res = await axios.get(url);
      const vids = res.data.results.filter(v => v.site === 'YouTube');
      if (vids.length === 0) {
        alert('No trailers available.');
        setShowModal(false);
        return;
      }
      setTrailers(vids);
      setActiveTrailer(vids[0].key);
    } catch (e) { console.log(e); }
    finally { setLoadingTrailers(false); }
  }

  function closeModal() {
    setShowModal(false);
    setActiveTrailer(null);
    setTrailers([]);
  }

  function handleSearch(text) {
    setQuery(text);
    if (text.length === 0) { fetchVideos(1, ''); return; }
    if (text.length < 2) return;
    fetchVideos(1, text);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎬 Videos</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search for trailers..."
          placeholderTextColor="#555"
          value={query}
          onChangeText={handleSearch}
          autoCorrect={false}
        />
      </View>

      {loading
        ? <ActivityIndicator color={BLUE} style={{ marginTop: 20 }} />
        : <FlatList
          data={items}
          keyExtractor={(item, i) => `${item.id}-${i}`}
          numColumns={2}
          contentContainerStyle={{ padding: 10 }}
          renderItem={({ item }) => {
            const title = item.title || item.name;
            const bg = item.backdrop_path || item.poster_path;
            return (
              <TouchableOpacity
                style={styles.videoCard}
                onPress={() => openTrailers(item.id, item.media_type)}
              >
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/w500${bg}` }}
                  style={styles.videoThumb}
                />
                <View style={styles.videoOverlay}>
                  <Text style={styles.videoPlay}>▶</Text>
                </View>
                <View style={styles.videoInfo}>
                  <Text style={styles.videoTitle} numberOfLines={1}>{title}</Text>
                  <Text style={styles.videoType}>{item.media_type === 'movie' ? 'Movie' : 'TV Show'}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
                onPress={() => page > 1 && fetchVideos(page - 1, query)}
                disabled={page === 1}
              >
                <Text style={styles.pageBtnText}>← Prev</Text>
              </TouchableOpacity>
              <Text style={styles.pageNum}>Page {page}</Text>
              <TouchableOpacity
                style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
                onPress={() => page < totalPages && fetchVideos(page + 1, query)}
                disabled={page === totalPages}
              >
                <Text style={styles.pageBtnText}>Next →</Text>
              </TouchableOpacity>
            </View>
          }
        />
      }

      {/* Trailer Modal */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.modalClose} onPress={closeModal}>
            <Text style={styles.modalCloseText}>✕ Close</Text>
          </TouchableOpacity>

          {loadingTrailers
            ? <ActivityIndicator color={BLUE} size="large" style={{ flex: 1 }} />
            : <>
              {activeTrailer && (
  <TouchableOpacity
    style={styles.player}
    onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${activeTrailer}`)}
  >
    <Image
      source={{ uri: `https://img.youtube.com/vi/${activeTrailer}/hqdefault.jpg` }}
      style={styles.player}
    />
    <View style={styles.videoOverlay}>
      <Text style={styles.videoPlay}>▶</Text>
    </View>
  </TouchableOpacity>
)}
              {/* Trailer thumbnails */}
              {trailers.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbRow}>
                  {trailers.map(t => (
                    <TouchableOpacity key={t.key} onPress={() => setActiveTrailer(t.key)}>
                      <Image
                        source={{ uri: `https://img.youtube.com/vi/${t.key}/hqdefault.jpg` }}
                        style={[styles.thumb, activeTrailer === t.key && styles.thumbActive]}
                      />
                      <Text style={styles.thumbName} numberOfLines={1}>{t.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          }
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 16, paddingBottom: 14 },
  backBtn: { backgroundColor: 'rgba(28,33,51,0.85)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 12 },
  backText: { color: '#fff', fontSize: 14 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD_BG, borderRadius: 12, marginHorizontal: 16, paddingHorizontal: 14, borderWidth: 1, borderColor: '#2a3050', marginBottom: 10 },
  searchIcon: { fontSize: 15, marginRight: 8 },
  input: { flex: 1, color: '#fff', fontSize: 14, paddingVertical: 12 },
  videoCard: { flex: 1, margin: 6, borderRadius: 10, overflow: 'hidden', backgroundColor: CARD_BG },
  videoThumb: { width: '100%', height: 110, backgroundColor: '#0a0f1e' },
  videoOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 110, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  videoPlay: { fontSize: 32, color: '#fff' },
  videoInfo: { padding: 8 },
  videoTitle: { color: '#fff', fontSize: 12, fontWeight: '600' },
  videoType: { color: BLUE, fontSize: 10, marginTop: 3 },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  pageBtn: { backgroundColor: CARD_BG, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#2a3050' },
  pageBtnDisabled: { opacity: 0.4 },
  pageBtnText: { color: '#fff', fontSize: 13 },
  pageNum: { color: '#888', fontSize: 13 },
  modal: { flex: 1, backgroundColor: '#000' },
  modalClose: { padding: 16, alignItems: 'flex-end' },
  modalCloseText: { color: '#fff', fontSize: 15 },
  player: { width: '100%', height: 220 },
  thumbRow: { padding: 12 },
  thumb: { width: 140, height: 80, borderRadius: 6, marginRight: 10, opacity: 0.7 },
  thumbActive: { opacity: 1, borderWidth: 2, borderColor: BLUE },
  thumbName: { color: '#aaa', fontSize: 10, marginTop: 4, width: 140 },
});