import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, FlatList, ImageBackground
} from 'react-native';
import axios from 'axios';

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451';
const BLUE = '#434BE7';
const BG = '#141414';
const CARD_BG = '#1c2133';

export default function CollectionDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCollection(); }, [id]);

  async function fetchCollection() {
    try {
      const res = await axios.get(`https://api.themoviedb.org/3/collection/${id}?api_key=${API_KEY}&language=en-US`);
      setCollection(res.data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  }

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color={BLUE} /></View>;
  if (!collection) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Backdrop */}
      <ImageBackground
        source={{ uri: `https://image.tmdb.org/t/p/original${collection.backdrop_path}` }}
        style={styles.backdrop}
      >
        <View style={styles.backdropOverlay}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <View style={styles.content}>
        {/* Header Row */}
        <View style={styles.topRow}>
          <Image
            source={{ uri: collection.poster_path ? `https://image.tmdb.org/t/p/w342${collection.poster_path}` : 'https://via.placeholder.com/110x165' }}
            style={styles.poster}
          />
          <View style={styles.info}>
            <Text style={styles.title}>{collection.name}</Text>
            <Text style={styles.moviesCount}>{collection.parts?.length} Movies</Text>
          </View>
        </View>

        {/* Overview */}
        {collection.overview ? (
          <>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.overview}>{collection.overview}</Text>
          </>
        ) : null}

        {/* Movies Grid */}
        <Text style={styles.sectionTitle}>Movies in Collection</Text>
        <FlatList
          data={collection.parts}
          numColumns={3}
          scrollEnabled={false}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('MovieDetail', { id: item.id })}
            >
              <View style={styles.cardHead}>
                <Image
                  source={{ uri: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : 'https://via.placeholder.com/100x150' }}
                  style={styles.cardImg}
                />
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>⭐ {item.vote_average?.toFixed(1)}</Text>
                </View>
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.cardYear}>{item.release_date?.slice(0, 4)}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },
  backdrop: { width: '100%', height: 260 },
  backdropOverlay: { flex: 1, backgroundColor: 'rgba(20,20,20,0.4)', justifyContent: 'flex-start', padding: 16, paddingTop: 50 },
  backBtn: { backgroundColor: 'rgba(28,33,51,0.85)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, alignSelf: 'flex-start' },
  backText: { color: '#fff', fontSize: 14 },
  content: { padding: 16 },
  topRow: { flexDirection: 'row', marginBottom: 20 },
  poster: { width: 110, height: 165, borderRadius: 12, backgroundColor: CARD_BG },
  info: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  title: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  moviesCount: { color: BLUE, fontSize: 14 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 12 },
  overview: { color: '#d1d0cf', fontSize: 14, lineHeight: 22, marginBottom: 8 },
  card: { flex: 1, margin: 4 },
  cardHead: { position: 'relative' },
  cardImg: { width: '100%', aspectRatio: 2 / 3, borderRadius: 8, backgroundColor: CARD_BG },
  ratingBadge: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(28,33,51,0.9)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5 },
  ratingText: { color: '#FFC107', fontSize: 9 },
  cardTitle: { color: '#fff', fontSize: 11, marginTop: 4 },
  cardYear: { color: '#888', fontSize: 10 },
});