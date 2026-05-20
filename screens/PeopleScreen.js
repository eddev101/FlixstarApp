import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import axios from 'axios';

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451';
const BLUE = '#434BE7';
const BG = '#141414';
const CARD_BG = '#1c2133';

export default function PeopleScreen({ navigation }) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => { fetchPeople(1); }, []);

  async function fetchPeople(p) {
    try {
      const res = await axios.get(`https://api.themoviedb.org/3/person/popular?api_key=${API_KEY}&page=${p}`);
      if (p === 1) setPeople(res.data.results);
      else setPeople(prev => [...prev, ...res.data.results]);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setLoadingMore(false); }
  }

  function loadMore() {
    const next = page + 1;
    setPage(next); setLoadingMore(true); fetchPeople(next);
  }

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color={BLUE} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Popular People</Text>
      </View>
      <FlatList
        data={people}
        numColumns={3}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 8 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator color={BLUE} /> : null}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('PersonDetail', { id: item.id })}
          >
            <Image
              source={{ uri: item.profile_path ? `https://image.tmdb.org/t/p/w185${item.profile_path}` : 'https://via.placeholder.com/100x100' }}
              style={styles.cardImg}
            />
            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.cardDept} numberOfLines={1}>{item.known_for_department}</Text>
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
  card: { flex: 1, margin: 6, alignItems: 'center' },
  cardImg: { width: '100%', aspectRatio: 1, borderRadius: 60, backgroundColor: CARD_BG },
  cardName: { color: '#fff', fontSize: 11, marginTop: 6, textAlign: 'center', fontWeight: '600' },
  cardDept: { color: '#888', fontSize: 10, textAlign: 'center' },
});