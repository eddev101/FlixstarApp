import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, FlatList
} from 'react-native';
import axios from 'axios';

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451';
const BLUE = '#434BE7';
const BG = '#141414';
const CARD_BG = '#1c2133';

export default function PersonDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState({ cast: [], crew: [] });
  const [loading, setLoading] = useState(true);
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => { fetchPerson(); }, [id]);

  async function fetchPerson() {
    try {
      const [personRes, creditsRes] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/person/${id}?api_key=${API_KEY}&language=en-US`),
        axios.get(`https://api.themoviedb.org/3/person/${id}/combined_credits?api_key=${API_KEY}&language=en-US`),
      ]);
      setPerson(personRes.data);
      const cast = creditsRes.data.cast.filter(c => !c.adult);
      const crew = creditsRes.data.crew.filter(c => !c.adult);
      setCredits({ cast, crew });
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  }

  function goToDetail(id, type) {
    if (type === 'movie') navigation.navigate('MovieDetail', { id });
    else navigation.navigate('TVShowDetail', { id });
  }

  function CreditCard({ item }) {
    const poster = item.poster_path
      ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
      : null;
    const title = item.title || item.name;
    const year = (item.release_date || item.first_air_date || '').slice(0, 4);
    return (
      <TouchableOpacity style={styles.creditCard} onPress={() => goToDetail(item.id, item.media_type)}>
        {poster
          ? <Image source={{ uri: poster }} style={styles.creditImg} />
          : <View style={[styles.creditImg, { backgroundColor: CARD_BG }]} />}
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>⭐ {item.vote_average?.toFixed(1)}</Text>
        </View>
        <Text style={styles.creditTitle} numberOfLines={1}>{title}</Text>
        <View style={styles.creditInfo}>
          <Text style={styles.creditType}>{item.media_type === 'movie' ? 'Movie' : 'TV Show'}</Text>
          <Text style={styles.creditYear}>{year}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color={BLUE} /></View>;
  if (!person) return null;

  const bio = person.biography || 'No biography available.';
  const shortBio = bio.length > 250 ? bio.substring(0, 250) + '...' : bio;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: person.profile_path ? `https://image.tmdb.org/t/p/w500${person.profile_path}` : 'https://via.placeholder.com/150x150' }}
          style={styles.profileImg}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.personName}>{person.name}</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Birthday:</Text>
            <Text style={styles.detailVal}>{person.birthday || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Birthplace:</Text>
            <Text style={styles.detailVal}>{person.place_of_birth || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Known For:</Text>
            <Text style={styles.detailVal}>{person.known_for_department || 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Biography */}
      <View style={styles.bioSection}>
        <Text style={styles.sectionTitle}>Biography</Text>
        <Text style={styles.bioText}>{showFullBio ? bio : shortBio}</Text>
        {bio.length > 250 && (
          <TouchableOpacity onPress={() => setShowFullBio(!showFullBio)}>
            <Text style={styles.readMore}>{showFullBio ? 'Show Less' : 'Read More'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Acting Credits */}
      {credits.cast.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Known For (Acting)</Text>
          <FlatList
            data={credits.cast}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `cast-${item.id}-${index}`}
            renderItem={({ item }) => <CreditCard item={item} />}
          />
        </View>
      )}

      {/* Crew Credits */}
      {credits.crew.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Credits (Director, Producer, etc.)</Text>
          <FlatList
            data={credits.crew}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `crew-${item.id}-${index}`}
            renderItem={({ item }) => <CreditCard item={item} />}
          />
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },
  backBtn: { marginTop: 50, marginLeft: 16, marginBottom: 10, backgroundColor: 'rgba(28,33,51,0.85)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, alignSelf: 'flex-start' },
  backText: { color: '#fff', fontSize: 14 },
  profileHeader: { flexDirection: 'row', padding: 16, backgroundColor: '#000', marginBottom: 4 },
  profileImg: { width: 130, height: 180, borderRadius: 10, backgroundColor: CARD_BG },
  profileInfo: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  personName: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  detailRow: { flexDirection: 'row', marginBottom: 6, flexWrap: 'wrap' },
  detailLabel: { color: BLUE, fontSize: 12, fontWeight: '600', marginRight: 6 },
  detailVal: { color: '#d1d0cf', fontSize: 12, flex: 1 },
  bioSection: { padding: 16, backgroundColor: '#1c1b1b', marginBottom: 4 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 10 },
  bioText: { color: '#d1d0cf', fontSize: 14, lineHeight: 22 },
  readMore: { color: BLUE, fontSize: 13, marginTop: 8, fontWeight: '600' },
  section: { paddingLeft: 16, marginBottom: 24, marginTop: 10 },
  creditCard: { width: 120, marginRight: 14 },
  creditImg: { width: 120, height: 175, borderRadius: 12, backgroundColor: CARD_BG, marginBottom: 8 },
  ratingBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(28,33,51,0.9)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  ratingText: { color: '#FFC107', fontSize: 10, fontWeight: '600' },
  creditTitle: { color: '#fff', fontSize: 12, fontWeight: '500', marginBottom: 3 },
  creditInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  creditType: { color: '#d1d0cf', fontSize: 10 },
  creditYear: { color: '#d1d0cf', fontSize: 10 },
});