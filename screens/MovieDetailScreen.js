import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, FlatList, Dimensions, Modal
} from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveMovieContinueWatching } from './continueWatching';
import { LinearGradient } from 'expo-linear-gradient';
import { Linking } from 'react-native';

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451';
const { width } = Dimensions.get('window');
const BLUE = '#434BE7';
const BG = '#141414';
const CARD_BG = '#1c2133';

export default function MovieDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeServer, setActiveServer] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  function downloadMovie() {
    const query = encodeURIComponent(movie.title);
    Linking.openURL(`https://1337x.to/category-search/${query}/Movies/1/`);
  }

  useEffect(() => { fetchMovie(); }, [id]);

  async function fetchMovie() {
    try {
      const res = await axios.get(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&append_to_response=credits,videos,recommendations,external_ids`
      );
      setMovie(res.data);
      const imdbId = res.data.external_ids?.imdb_id;
      setActiveServer(imdbId
        ? `https://streamimdb.ru/embed/movie/${imdbId}`
        : `https://player.videasy.net/movie/${id}`
      );
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  }

  async function addToWatchlist() {
    try {
      const existing = await AsyncStorage.getItem('watchlist');
      const list = existing ? JSON.parse(existing) : [];
      const item = { id: id.toString(), type: 'movie' };
      if (!list.some(i => i.id === item.id && i.type === item.type)) {
        list.push(item);
        await AsyncStorage.setItem('watchlist', JSON.stringify(list));
        alert('Added to watchlist!');
      } else alert('Already in watchlist.');
    } catch (e) { console.log(e); }
  }

  async function addToFavorites() {
    try {
      const existing = await AsyncStorage.getItem('favorites');
      const list = existing ? JSON.parse(existing) : [];
      const item = { id: id.toString(), type: 'movie' };
      if (!list.some(i => i.id === item.id && i.type === item.type)) {
        list.push(item);
        await AsyncStorage.setItem('favorites', JSON.stringify(list));
        alert('Added to favorites!');
      } else alert('Already in favorites.');
    } catch (e) { console.log(e); }
  }

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color={BLUE} /></View>;
  if (!movie) return null;

  const imdbId = movie.external_ids?.imdb_id;
  const servers = [
    { name: 'StreamIMDB', url: imdbId ? `https://streamimdb.ru/embed/movie/${imdbId}` : null },
    { name: 'Videasy', url: `https://player.videasy.net/movie/${id}` },
    { name: 'Vidsrc', url: `https://vidsrc.me/embed/${id}` },
    { name: '2Embed', url: `https://hnembed.cc/embed/movie/${id}` },
    { name: 'SuperEmbed', url: `https://multiembed.mov/?video_id=${id}&tmdb=1` },
    { name: 'Vidplus', url: `https://player.vidplus.to/embed/movie/${id}` },
  ].filter(s => s.url);

  const director = movie.credits?.crew?.find(c => c.job === 'Director');
  const producers = movie.credits?.crew?.filter(c => c.job === 'Producer').slice(0, 3);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Backdrop */}
      <View>
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` }}
        style={styles.backdrop}
      />

      <LinearGradient
        colors={['transparent', '#141414']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.backdropOverlay}
      />

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </View>

      {/* Player */}
      {showPlayer && activeServer && (
        <View style={styles.playerWrap}>
          <WebView
            source={{ uri: activeServer }}
            style={{ flex: 1 }}
            allowsFullscreenVideo
            javaScriptEnabled
            domStorageEnabled
          />
          <TouchableOpacity style={styles.closePlayer} onPress={() => setShowPlayer(false)}>
            <Text style={styles.closePlayerText}>✕ Close Player</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.content}>
        {/* Top Row */}
        <View style={styles.topRow}>
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w342${movie.poster_path}` }}
            style={styles.poster}
          />
          <View style={styles.info}>
            <Text style={styles.title}>{movie.title}</Text>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Released:</Text><Text style={styles.detailVal}>{movie.release_date || 'N/A'}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Duration:</Text><Text style={styles.detailVal}>{movie.runtime ? movie.runtime + ' min' : 'N/A'}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Rating:</Text><Text style={[styles.detailVal, { color: '#FFC107' }]}>⭐ {movie.vote_average?.toFixed(1)}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Genres:</Text><Text style={styles.detailVal}>{movie.genres?.slice(0, 3).map(g => g.name).join(', ')}</Text></View>
            {director && <View style={styles.detailRow}><Text style={styles.detailLabel}>Director:</Text><Text style={[styles.detailVal, { color: '#d1d0cf' }]}>{director.name}</Text></View>}
            {producers?.length > 0 && <View style={styles.detailRow}><Text style={styles.detailLabel}>Producers:</Text><Text style={styles.detailVal} numberOfLines={2}>{producers.map(p => p.name).join(', ')}</Text></View>}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.watchlistBtn} onPress={addToWatchlist}>
            <Text style={styles.actionBtnText}>🔖 Watchlist</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.favBtn} onPress={addToFavorites}>
            <Text style={styles.actionBtnText}>❤️ Favorites</Text>
          </TouchableOpacity>
        </View>

        {/* Overview */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.overview}>{movie.overview}</Text>

        {/* Watch Now n Download */}
        <TouchableOpacity style={styles.playBtn} onPress={() => { saveMovieContinueWatching(id); setShowPlayer(true); }}>
          <Text style={styles.playBtnText}>▶  Watch Now</Text>
        </TouchableOpacity>
         <TouchableOpacity style={styles. downloadBtn} onPress={downloadMovie}>
              <Text style={styles. downloadBtnText}>⬇ Download</Text>
            </TouchableOpacity>

        {/* Servers */}
        <Text style={styles.sectionTitle}>Servers</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
          {servers.map(s => (
            <TouchableOpacity
              key={s.name}
              style={[styles.serverBtn, activeServer === s.url && styles.serverBtnActive]}
              onPress={() => { setActiveServer(s.url); saveMovieContinueWatching(id); setShowPlayer(true); }}
            >
              <Text style={[styles.serverText, activeServer === s.url && styles.serverTextActive]}>▶  {s.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trailers */}
        {movie.videos?.results?.filter(v => v.type === 'Trailer').length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Trailers</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
              {movie.videos.results.filter(v => v.type === 'Trailer').map(t => (
                <TouchableOpacity
                  key={t.key}
                  style={styles.trailerBtn}
                  onPress={() => { setTrailerKey(t.key); setShowTrailer(true); }}
                >
                  <Image
                    source={{ uri: `https://img.youtube.com/vi/${t.key}/hqdefault.jpg` }}
                    style={styles.trailerThumb}
                  />
                  <View style={styles.trailerOverlay}>
                    <Text style={styles.trailerPlay}>▶</Text>
                  </View>
                  <Text style={styles.trailerName} numberOfLines={1}>{t.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Trailer Modal */}
            <Modal visible={showTrailer} animationType="slide" transparent onRequestClose={() => { setShowTrailer(false); setTrailerKey(null); }}>
            <View style={styles.trailerModal}>
              <TouchableOpacity style={styles.trailerClose} onPress={() => { setShowTrailer(false); setTrailerKey(null); }}>
                <Text style={styles.trailerCloseText}>✕ Close</Text>
              </TouchableOpacity>
              {trailerKey && (
                <TouchableOpacity
                  style={styles.trailerThumbWrap}
                  onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${trailerKey}`)}
                >
                  <Image
                    source={{ uri: `https://img.youtube.com/vi/${trailerKey}/hqdefault.jpg` }}
                    style={styles.trailerThumbBig}
                  />
                  <View style={styles.trailerPlayOverlay}>
                    <Text style={styles.trailerPlayIcon}>▶</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
            </Modal>
          </>
        )}

        {/* Cast */}
        <Text style={styles.sectionTitle}>Cast</Text>
        <FlatList
          data={movie.credits?.cast?.slice(0, 10)}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.castCard} onPress={() => navigation.navigate('PersonDetail', { id: item.id })}>
              <Image
                source={{ uri: item.profile_path ? `https://image.tmdb.org/t/p/w185${item.profile_path}` : 'https://via.placeholder.com/70x70' }}
                style={styles.castImg}
              />
              <Text style={styles.castName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.castChar} numberOfLines={1}>{item.character}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Recommendations */}
        {movie.recommendations?.results?.length > 0 && (<>
          <Text style={styles.sectionTitle}>More Like This</Text>
          <FlatList
            data={movie.recommendations.results.slice(0, 20)}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.recCard} onPress={() => navigation.push('MovieDetail', { id: item.id })}>
                <Image source={{ uri: `https://image.tmdb.org/t/p/w342${item.poster_path}` }} style={styles.recImg} />
                <View style={styles.recRating}><Text style={{ color: '#FFC107', fontSize: 10 }}>⭐ {item.vote_average?.toFixed(1)}</Text></View>
                <Text style={styles.recTitle} numberOfLines={1}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
        </>)}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },
  backdrop: { width: '100%', height: 240 },
  backdropOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,20,20,0.45)', height: 240 },
  backBtn: { position: 'absolute', top: 44, left: 16, backgroundColor: 'rgba(28,33,51,0.85)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  backText: { color: '#fff', fontSize: 14 },
  playerWrap: { width: '100%', height: 230, backgroundColor: '#000' },
  closePlayer: { backgroundColor: CARD_BG, padding: 10, alignItems: 'center' },
  closePlayerText: { color: '#fff', fontSize: 13 },
  content: { padding: 16 },
  topRow: { flexDirection: 'row', marginBottom: 16 },
  poster: { width: 115, height: 170, borderRadius: 12, backgroundColor: CARD_BG },
  info: { flex: 1, marginLeft: 14 },
  title: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 10 },
  detailRow: { flexDirection: 'row', marginBottom: 5, flexWrap: 'wrap' },
  detailLabel: { color: '#fff', fontSize: 12, fontWeight: '600', marginRight: 6 },
  detailVal: { color: '#d1d0cf', fontSize: 12, flex: 1 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  watchlistBtn: { flex: 1, backgroundColor: CARD_BG, padding: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#2a3050' },
  favBtn: { flex: 1, backgroundColor: CARD_BG, padding: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#2a3050' },
  actionBtnText: { color: '#fff', fontSize: 13, fontWeight: '500' },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 20, marginBottom: 10 },
  overview: { color: '#d1d0cf', fontSize: 14, lineHeight: 22 },
  playBtn: { backgroundColor: 'rgb(67, 75, 231)', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  playBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  downloadBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgb(67, 75, 231)',padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  downloadBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  serverBtn: { backgroundColor: CARD_BG, paddingVertical: 9, paddingHorizontal: 16, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#2a3050' },
  serverBtnActive: { backgroundColor: BLUE, borderColor: BLUE },
  serverText: { color: '#aaa', fontSize: 13 },
  serverTextActive: { color: '#fff', fontWeight: '700' },
  castCard: { width: 80, marginRight: 14, alignItems: 'center' },
  castImg: { width: 70, height: 70, borderRadius: 35, backgroundColor: CARD_BG },
  castName: { color: '#fff', fontSize: 11, textAlign: 'center', marginTop: 6 },
  castChar: { color: '#888', fontSize: 10, textAlign: 'center' },
  recCard: { width: 115, marginRight: 12 },
  recImg: { width: 115, height: 165, borderRadius: 10, backgroundColor: CARD_BG },
  recRating: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(28,33,51,0.85)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  recTitle: { color: '#fff', fontSize: 11, marginTop: 6 },
  trailerBtn: { width: 160, marginRight: 12 },
  trailerThumb: { width: 160, height: 90, borderRadius: 8, backgroundColor: CARD_BG },
  trailerOverlay: { position: 'absolute', top: 0, left: 0, width: 160, height: 90, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 8 },
  trailerPlay: { fontSize: 28, color: '#fff' },
  trailerName: { color: '#aaa', fontSize: 11, marginTop: 5 },
  trailerModal: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  trailerClose: { padding: 16, alignItems: 'flex-end' },
  trailerCloseText: { color: '#fff', fontSize: 15 },
  trailerPlayer: { width: '100%', height: 220 },
  trailerThumbWrap: { width: '100%', height: 220, position: 'relative' },
  trailerThumbBig: { width: '100%', height: 220 },
  trailerPlayOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  trailerPlayIcon: { fontSize: 50, color: '#fff' },
});