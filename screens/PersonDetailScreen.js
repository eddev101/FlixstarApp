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
  const { id } = route.params || {};
  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState({ cast: [], crew: [] });
  const [loading, setLoading] = useState(true);
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    if (id) fetchPerson();
    else setLoading(false);
  }, [id]);

  async function fetchPerson() {
    try {
      const [personRes, creditsRes] = await Promise.allSettled([
        axios.get(`https://api.themoviedb.org/3/person/${id}?api_key=${API_KEY}&language=en-US`),
        axios.get(`https://api.themoviedb.org/3/person/${id}/combined_credits?api_key=${API_KEY}&language=en-US`),
      ]);

      const personData =
        personRes.status === 'fulfilled' ? personRes.value.data : null;

      const creditsData =
        creditsRes.status === 'fulfilled' ? creditsRes.value.data : null;

      setPerson(personData);

      const cast =
        creditsData?.cast?.filter(c => !c.adult) || [];

      const crew =
        creditsData?.crew?.filter(c => !c.adult) || [];

      setCredits({ cast, crew });

    } catch (e) {
      console.log("PERSON ERROR:", e);
      setPerson(null);
      setCredits({ cast: [], crew: [] });
    } finally {
      setLoading(false);
    }
  }

  function goToDetail(id, type) {
    if (!id) return;

    if (type === 'movie') navigation.navigate('MovieDetail', { id });
    else navigation.navigate('TVShowDetail', { id });
  }

  function CreditCard({ item }) {
    const poster = item.poster_path
      ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
      : 'https://via.placeholder.com/120x175';

    const title = item.title || item.name || 'Unknown';
    const year =
      (item.release_date || item.first_air_date || '').slice(0, 4);

    const type =
      item.media_type === 'movie' ? 'movie' : 'tv';

    return (
      <TouchableOpacity
        style={styles.creditCard}
        onPress={() => goToDetail(item.id, type)}
      >
        <Image source={{ uri: poster }} style={styles.creditImg} />

        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>
            ⭐ {item.vote_average ? item.vote_average.toFixed(1) : '0.0'}
          </Text>
        </View>

        <Text style={styles.creditTitle} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.creditInfo}>
          <Text style={styles.creditType}>
            {type === 'movie' ? 'Movie' : 'TV Show'}
          </Text>
          <Text style={styles.creditYear}>{year || '----'}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  if (!person) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: '#fff' }}>Failed to load person</Text>
      </View>
    );
  }

  const bio = person.biography || 'No biography available.';
  const shortBio =
    bio.length > 250 ? bio.substring(0, 250) + '...' : bio;

  const cast = credits.cast || [];
  const crew = credits.crew || [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.profileHeader}>
        <Image
          source={{
            uri: person.profile_path
              ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
              : 'https://via.placeholder.com/150x150'
          }}
          style={styles.profileImg}
        />

        <View style={styles.profileInfo}>
          <Text style={styles.personName}>
            {person.name || 'Unknown'}
          </Text>

          <Text style={styles.detailVal}>
            Birthday: {person.birthday || 'N/A'}
          </Text>

          <Text style={styles.detailVal}>
            Birthplace: {person.place_of_birth || 'N/A'}
          </Text>

          <Text style={styles.detailVal}>
            Known For: {person.known_for_department || 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.bioSection}>
        <Text style={styles.sectionTitle}>Biography</Text>

        <Text style={styles.bioText}>
          {showFullBio ? bio : shortBio}
        </Text>

        {bio.length > 250 && (
          <TouchableOpacity onPress={() => setShowFullBio(!showFullBio)}>
            <Text style={styles.readMore}>
              {showFullBio ? 'Show Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {cast.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Known For (Acting)</Text>

          <FlatList
            data={cast}
            horizontal
            keyExtractor={(item, index) => `cast-${item.id}-${index}`}
            renderItem={({ item }) => <CreditCard item={item} />}
          />
        </View>
      )}

      {crew.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Credits (Director, Producer, etc.)
          </Text>

          <FlatList
            data={crew}
            horizontal
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG
  },

  backBtn: {
    marginTop: 50,
    marginLeft: 16,
    marginBottom: 10,
    backgroundColor: 'rgba(28,33,51,0.85)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    alignSelf: 'flex-start'
  },

  backText: { color: '#fff', fontSize: 14 },

  profileHeader: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#000'
  },

  profileImg: {
    width: 130,
    height: 180,
    borderRadius: 10,
    backgroundColor: CARD_BG
  },

  profileInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center'
  },

  personName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10
  },

  detailVal: {
    color: '#d1d0cf',
    fontSize: 12,
    marginBottom: 4
  },

  bioSection: {
    padding: 16,
    backgroundColor: '#1c1b1b'
  },

  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10
  },

  bioText: {
    color: '#d1d0cf',
    fontSize: 14,
    lineHeight: 22
  },

  readMore: {
    color: BLUE,
    marginTop: 8,
    fontWeight: '600'
  },

  section: {
    paddingLeft: 16,
    marginTop: 10,
    marginBottom: 24
  },

  creditCard: { width: 120, marginRight: 14 },

  creditImg: {
    width: 120,
    height: 175,
    borderRadius: 12,
    backgroundColor: CARD_BG
  },

  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(28,33,51,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },

  ratingText: {
    color: '#FFC107',
    fontSize: 10,
    fontWeight: '600'
  },

  creditTitle: {
    color: '#fff',
    fontSize: 12,
    marginTop: 6
  },

  creditInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  creditType: { color: '#d1d0cf', fontSize: 10 },
  creditYear: { color: '#d1d0cf', fontSize: 10 }
});
