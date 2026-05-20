import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, FlatList, Image,
  TouchableOpacity, StyleSheet, ActivityIndicator,
  Dimensions, ImageBackground
} from 'react-native';
import axios from 'axios';
import { getContinueWatching, removeFromContinueWatching } from './continueWatching';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451';
const { width } = Dimensions.get('window');


const BLUE = '#434BE7';
const BG = '#141414';
const CARD_BG = '#1c2133';

export default function HomeScreen({ navigation }) {
  const [continueWatching, setContinueWatching] = useState([]);
  const [trending, setTrending] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [trendingShows, setTrendingShows] = useState([]);
  const [popShows, setPopShows] = useState([]);
  const [slider, setSlider] = useState([]);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (slider.length === 0) return;
    const timer = setInterval(() => {
      setSliderIndex(i => {
        const next = (i + 1) % slider.length;
        sliderRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [slider]);


  useFocusEffect(
    React.useCallback(() => {
      loadContinueWatching();
    }, [])
  );

  async function loadContinueWatching() {
    const list = await getContinueWatching();
    if (!list.length) { setContinueWatching([]); return; }
    try {
      const fetched = await Promise.all(list.map(async item => {
        const url = item.type === 'movie'
          ? `https://api.themoviedb.org/3/movie/${item.id}?api_key=${API_KEY}`
          : `https://api.themoviedb.org/3/tv/${item.id}?api_key=${API_KEY}`;
        const res = await axios.get(url);
        return { ...res.data, type: item.type, season: item.season, episode: item.episode };
      }));
      setContinueWatching(fetched);
    } catch (e) { console.log(e); }
  }


  async function fetchAll() {
    try {
      const [t, n, tr, ts, ps] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/trending/movie/day?api_key=${API_KEY}`),
        axios.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}`),
        axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}`),
        axios.get(`https://api.themoviedb.org/3/trending/tv/week?api_key=${API_KEY}`),
        axios.get(`https://api.themoviedb.org/3/trending/tv/day?api_key=${API_KEY}`),
      ]);
      const movies = t.data.results;
      const tvs = ts.data.results;
      const combined = [...movies, ...tvs].sort(() => Math.random() - 0.5).slice(0, 6);
      setSlider(combined);
      setTrending(t.data.results.slice(0, 20));
      setNowPlaying(n.data.results.slice(0, 20));
      setTopRated(tr.data.results.slice(0, 20));
      setTrendingShows(ts.data.results.slice(0, 20));
      setPopShows(ps.data.results.slice(0, 20));
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  function goToDetail(id, type) {
    if (type === 'movie' || type === undefined) navigation.navigate('MovieDetail', { id });
    else navigation.navigate('TVShowDetail', { id });
  }

  function MovieCard({ item, type = 'movie' }) {
    const poster = item.poster_path
      ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
      : null;
    const title = item.title || item.name;
    const year = (item.release_date || item.first_air_date || '').slice(0, 4);
    const rating = item.vote_average?.toFixed(1);
    return (
      <TouchableOpacity style={styles.movieCard} onPress={() => goToDetail(item.id, type)}>
        <View style={styles.cardHead}>
          {poster
            ? <Image source={{ uri: poster }} style={styles.cardImg} />
            : <View style={[styles.cardImg, { backgroundColor: CARD_BG }]} />}
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {rating}</Text>
          </View>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
        <View style={styles.cardInfo}>
          <Text style={styles.cardType}>{type === 'tv' ? 'TV Show' : 'Movie'}</Text>
          <Text style={styles.cardYear}>{year}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  function TVCard({ item }) {
    const poster = item.poster_path
      ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
      : null;
    const title = item.name;
    const year = (item.first_air_date || '').slice(0, 4);
    const rating = item.vote_average?.toFixed(1);
    return (
      <TouchableOpacity style={styles.tvCard} onPress={() => goToDetail(item.id, 'tv')}>
        <View style={styles.tvCardHead}>
          {poster
            ? <Image source={{ uri: poster }} style={styles.tvCardImg} />
            : <View style={[styles.tvCardImg, { backgroundColor: CARD_BG }]} />}
          <View style={styles.liveBadge}><Text style={styles.liveBadgeText}>{rating}</Text></View>
          <View style={styles.yearBadge}><Text style={styles.yearBadgeText}>{year}</Text></View>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
      </TouchableOpacity>
    );
  }

  function Section({ title, data, type = 'movie', isTv = false, onViewAll }) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {onViewAll && (
            <TouchableOpacity onPress={onViewAll}>
              <Text style={styles.viewAll}>View All →</Text>
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          data={data}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) =>
            isTv
              ? <TVCard item={item} />
              : <MovieCard item={item} type={type} />
          }
        />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  const currentSlide = slider[sliderIndex];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>FLIXSTAR</Text>
      </View>

      {/* Hero Slider */}
      {slider.length > 0 && (
        <View style={styles.sliderContainer}>
          <ScrollView
            ref={sliderRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onMomentumScrollEnd={e => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / width);
              setSliderIndex(idx);
            }}
          >
            {slider.map((item, i) => {
              const isMovie = item.media_type === 'movie' || item.title;
              const title = item.title || item.name;
              const year = (item.release_date || item.first_air_date || '').slice(0, 4);
              const rating = item.vote_average?.toFixed(1);
              const backdrop = item.backdrop_path
                ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
                : null;
              return (
                <ImageBackground
                  key={i}
                  source={{ uri: backdrop }}
                  style={styles.slide}
                >
                <LinearGradient
                  colors={['transparent', 'rgba(20,20,20,0.85)', '#141414']}
                  style={styles.slideOverlay}
                >
                  <View style={styles.slideMeta}>
                    <Text style={styles.slideMetaText}>{year}</Text>
                    <Text style={styles.slideMetaText}>⭐ {rating}</Text>
                    <Text style={[styles.slideMetaText, { color: BLUE }]}>{isMovie ? 'Movie' : 'TV Show'}</Text>
                  </View>
                  <Text style={styles.slideTitle}>{title}</Text>
                  <View style={styles.slideButtons}>
                    <TouchableOpacity style={styles.slidePlayBtn} onPress={() => goToDetail(item.id, isMovie ? 'movie' : 'tv')}>
                      <Text style={styles.slidePlayText}>▶  Play</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.slideListBtn} onPress={() => goToDetail(item.id, isMovie ? 'movie' : 'tv')}>
                      <Text style={styles.slideListText}>+ My List</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
                </ImageBackground>
              );
            })}
          </ScrollView>
          {/* Dots */}
          <View style={styles.dots}>
            {slider.map((_, i) => (
              <View key={i} style={[styles.dot, i === sliderIndex && styles.dotActive]} />
            ))}
          </View>
        </View>
      )}

      {/* Sections */}

      {continueWatching.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue Watching</Text>
          </View>
          <FlatList
            data={continueWatching}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => {
              const title = item.title || item.name;
              const sub = item.type === 'tv' ? `S${item.season} • E${item.episode}` : 'Continue Watching';
              return (
                <TouchableOpacity
                  style={styles.movieCard}
                  onPress={() => item.type === 'movie'
                    ? navigation.navigate('MovieDetail', { id: item.id })
                    : navigation.navigate('TVShowDetail', { id: item.id })}
                >
                  <View style={styles.cardHead}>
  <Image
    source={{ uri: `https://image.tmdb.org/t/p/w342${item.poster_path}` }}
    style={styles.cardImg}
  />

        {/* REMOVE BUTTON */}
        <TouchableOpacity
          style={[styles.removeBadge, { backgroundColor: BLUE }]}
          onPress={async () => {
            await removeFromContinueWatching(item.id, item.type);
            loadContinueWatching();
          }}
        >

          <Text style={styles.removeBtnText}>✕</Text>
        </TouchableOpacity>

      
      </View>
                  <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
                  <Text style={[styles.cardYear, { color: BLUE }]}>{sub}</Text>
                </TouchableOpacity>

                
              );
            }}
          />
        </View>
      )}


      <Section
        title="Now Playing"
        data={nowPlaying}
        type="movie"
        onViewAll={() => navigation.navigate('Movies')}
      />
      <Section
        title="Trending Movies"
        data={trending}
        type="movie"
        onViewAll={() => navigation.navigate('Movies')}
      />
      <Section
        title="Top Rated Movies"
        data={topRated}
        type="movie"
        onViewAll={() => navigation.navigate('Movies')}
      />
      <Section
        title="Today's Top TV Shows"
        data={popShows}
        isTv
        onViewAll={() => navigation.navigate('TVShows')}
      />
      <Section
        title="This Week's Top TV Shows"
        data={trendingShows}
        isTv
        onViewAll={() => navigation.navigate('TVShows')}
      />

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },

  // Header
  header: {
    paddingTop: 30, paddingBottom: 14, paddingHorizontal: 16,
    backgroundColor: 'rgba(20,20,20,0.85)',
    position: 'relative', top: 0, left: 0, right: 0, zIndex: 10,
  },
  logo: { fontSize: 22, fontWeight: '700', color: BLUE, letterSpacing: 1, fontFamily: 'fantasy', textAlign: 'center'},

  // Slider
  sliderContainer: { marginBottom: 10 },
  slide: { width, height: 420, justifyContent: 'flex-end' },
  slideOverlay: {
  padding: 24, paddingBottom: 50,
  background: 'transparent',
  backgroundImage: 'linear-gradient(to bottom, transparent, #141414)',
},
  slideMeta: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  slideMetaText: { color: '#ccc', fontSize: 13, backgroundColor: 'rgba(20,33,51,0.8)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  slideTitle: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 14, fontFamily: 'serif' },
  slideButtons: { flexDirection: 'row', gap: 12 },
  slidePlayBtn: { backgroundColor: BLUE, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8 },
  slidePlayText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  slideListBtn: { backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  slideListText: { color: '#fff', fontSize: 15 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 6 },
  dot: { width: 30, height: 2, backgroundColor: 'rgba(229,9,20,0.4)', borderRadius: 2 },
  dotActive: { backgroundColor: BLUE },

  // Sections
  section: { marginBottom: 30, paddingLeft: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16, marginBottom: 14 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  viewAll: { color: BLUE, fontSize: 13 },

  // Movie Card
  movieCard: { width: 130, marginRight: 14 },
  cardHead: { position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 10 },
  cardImg: { width: 130, height: 190, borderRadius: 12, backgroundColor: CARD_BG },
  ratingBadge: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(28,33,51,0.85)',
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8,
  },
  ratingText: { color: '#FFC107', fontSize: 11, fontWeight: '600' },
  removeBadge: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(28,33,51,0.85)',
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20,
  },
  removeBtnText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: '500', marginBottom: 4 },
  cardInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  cardType: { color: '#d1d0cf', fontSize: 10 },
  cardYear: { color: '#d1d0cf', fontSize: 10 },

  // TV Card (wider, landscape-ish)
  tvCard: { width: 130, marginRight: 14 },
  tvCardHead: { position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 10 },
  tvCardImg: { width: 130, height: 190, borderRadius: 12, backgroundColor: CARD_BG },
  liveBadge: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: 'hsl(0,79%,63%)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  liveBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  yearBadge: {
    position: 'absolute', bottom: 10, left: 10,
    backgroundColor: 'rgba(28,33,51,0.8)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  yearBadgeText: { color: '#fff', fontSize: 11 },
});