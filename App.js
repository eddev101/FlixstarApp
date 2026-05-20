import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './screens/HomeScreen';
import MoviesScreen from './screens/MoviesScreen';
import TVShowsScreen from './screens/TVShowsScreen';
import SearchScreen from './screens/SearchScreen';
import MoreScreen from './screens/MoreScreen';
import WatchlistScreen from './screens/WatchlistScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import MovieDetailScreen from './screens/MovieDetailScreen';
import TVShowDetailScreen from './screens/TVShowDetailScreen';
import PersonDetailScreen from './screens/PersonDetailScreen';
import GenresScreen from './screens/GenresScreen';
import GenreDetailScreen from './screens/GenreDetailScreen';
import PeopleScreen from './screens/PeopleScreen';
import TopMoviesScreen from './screens/TopMoviesScreen';
import TopTVShowsScreen from './screens/TopTVShowsScreen';
import CollectionsScreen from './screens/CollectionsScreen';
import CollectionDetailScreen from './screens/CollectionDetailScreen';
import VideosScreen from './screens/VideosScreen';


const { width, height } = Dimensions.get('window');
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function SplashScreenView() {
  return (
    <View style={styles.splash}>
      <Image
        source={require('./assets/splash-icon.png')}
        style={styles.splashImg}
        resizeMode="cover"
      />
    </View>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#141414', borderTopColor: '#1c2133', height: 60 },
        tabBarActiveTintColor: '#434BE7',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: { fontSize: 11, marginBottom: 6 },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Movies') iconName = focused ? 'film' : 'film-outline';
          else if (route.name === 'TVShows') iconName = focused ? 'tv' : 'tv-outline';
          else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'More') iconName = focused ? 'menu' : 'menu-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Movies" component={MoviesScreen} />
      <Tab.Screen name="TVShows" component={TVShowsScreen} options={{ title: 'TV Shows' }} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
      <Stack.Screen name="TVShowDetail" component={TVShowDetailScreen} />
      <Stack.Screen name="PersonDetail" component={PersonDetailScreen} />
      <Stack.Screen name="Genres" component={GenresScreen} />
      <Stack.Screen name="GenreDetail" component={GenreDetailScreen} />
      <Stack.Screen name="People" component={PeopleScreen} />
      <Stack.Screen name="TopMovies" component={TopMoviesScreen} />
      <Stack.Screen name="TopTVShows" component={TopTVShowsScreen} />
      <Stack.Screen name="Watchlist" component={WatchlistScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="Collections" component={CollectionsScreen} />
      <Stack.Screen name="CollectionDetail" component={CollectionDetailScreen} />
      <Stack.Screen name="Videos" component={VideosScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
  const timer = setTimeout(() => setShowSplash(false), 2500);
  return () => clearTimeout(timer);
}, []);

  if (showSplash) return <SplashScreenView />;

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <RootNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, width, height, backgroundColor: '#000' },
  splashImg: { width, height },
});