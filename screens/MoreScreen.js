import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';

const BLUE = '#434BE7';
const BG = '#141414';
const CARD_BG = '#1c2133';

const menuItems = [
  { label: 'Genres', icon: '🎭', screen: 'Genres' },
  { label: 'Collections', icon: '🎞️', screen: 'Collections' },
  { label: 'People', icon: '👤', screen: 'People' },
  { label: 'Top Movies', icon: '🏆', screen: 'TopMovies' },
  { label: 'Top TV Series', icon: '📺', screen: 'TopTVShows' },
  { label: 'My Watchlist', icon: '🔖', screen: 'Watchlist' },
  { label: 'My Favorites', icon: '❤️', screen: 'Favorites' },
  { label: 'Videos', icon: '🎥', screen: 'Videos' },
];

export default function MoreScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>FLIXSTAR</Text>
        <Text style={styles.subtitle}>More Options</Text>
      </View>

      <View style={styles.grid}>
        {menuItems.map(item => (
          <TouchableOpacity
            key={item.label}
            style={styles.card}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.cardIcon}>{item.icon}</Text>
            <Text style={styles.cardLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24 },
  logo: { fontSize: 24, fontWeight: '800', color: BLUE, letterSpacing: 3, marginBottom: 4 },
  subtitle: { color: '#888', fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 12 },
  card: {
    width: '46%', backgroundColor: CARD_BG, borderRadius: 14,
    padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#2a3050',
  },
  cardIcon: { fontSize: 36, marginBottom: 10 },
  cardLabel: { color: '#fff', fontSize: 15, fontWeight: '600', textAlign: 'center' },
});