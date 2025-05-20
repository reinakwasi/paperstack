// src/screens/SearchScreen.js
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import SearchResultCard from '../components/SearchResultCard';

const filters = [
  { label: 'All', icon: 'apps' },
  { label: 'Articles', icon: 'file-document-outline' },
  { label: 'Authors', icon: 'account-outline' },
  { label: 'Journals', icon: 'book-outline' },
];

const recentSearches = [
  { label: 'Books 105', color: '#4f5ef7' },
  { label: 'Nature 2023', color: '#e84393' },
  { label: 'Jane Smith', color: '#2ecc71' },
];

const allResults = [
  {
    id: '1',
    type: 'Article',
    tag: 'Article',
    tagColor: '#4f5ef7',
    title: 'A Review of Deep Learning Methods for Image Classification',
    authors: 'Jane Smith',
    journal: 'AI Journal',
    year: '2023',
    open: true,
  },
  {
    id: '2',
    type: 'Author',
    tag: 'Author',
    tagColor: '#2ecc71',
    name: 'Jane Smith',
    affiliation: 'University of Zurich',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    follow: true,
  },
  {
    id: '3',
    type: 'Journal',
    tag: 'Journal',
    tagColor: '#f4d03f',
    name: 'AI Journal',
    impact: '7.3',
    browse: true,
  },
];

const SearchScreen = () => {
  const [searchText, setSearchText] = React.useState('Books 105');
  const [activeFilter, setActiveFilter] = React.useState('All');

  // Filtering logic
  const filteredResults = allResults.filter(item => {
    // Filter by type
    if (activeFilter !== 'All') {
      if (activeFilter === 'Articles' && item.type !== 'Article') return false;
      if (activeFilter === 'Authors' && item.type !== 'Author') return false;
      if (activeFilter === 'Journals' && item.type !== 'Journal') return false;
    }
    // Filter by search text
    if (searchText) {
      const text = searchText.toLowerCase();
      if (item.type === 'Article' && !item.title.toLowerCase().includes(text) && !item.authors.toLowerCase().includes(text)) return false;
      if (item.type === 'Author' && !item.name.toLowerCase().includes(text)) return false;
      if (item.type === 'Journal' && !item.name.toLowerCase().includes(text)) return false;
    }
    return true;
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#fafbfc' }}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>PaperStack</Text>
        <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.avatar} />
      </View>
      {/* Search Bar */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={20} color="#bbb" style={{ marginLeft: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search papers, authors, or journals..."
          placeholderTextColor="#bbb"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        {filters.map((filter, idx) => (
          <TouchableOpacity
            key={filter.label}
            style={[styles.filterChip, activeFilter === filter.label && styles.filterChipActive]}
            onPress={() => setActiveFilter(filter.label)}
          >
            <MaterialCommunityIcons name={filter.icon} size={18} color={activeFilter === filter.label ? '#fff' : '#888'} style={{ marginRight: 4 }} />
            <Text style={[styles.filterText, activeFilter === filter.label && styles.filterTextActive]}>{filter.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Recent Searches */}
      <View style={styles.recentRow}>
        <Text style={styles.recentTitle}>Recent Searches</Text>
        <TouchableOpacity>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.recentChipsRow}>
        {recentSearches.map((item, idx) => (
          <TouchableOpacity key={item.label} style={[styles.recentChip, { backgroundColor: item.color + '22' }]}> 
            <Text style={[styles.recentChipText, { color: item.color }]}>{item.label}</Text>
            <Ionicons name="open-outline" size={14} color={item.color} style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        ))}
      </View>
      {/* Showing results for... */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsForText}>Showing results for "<Text style={{ color: '#4f5ef7' }}>{searchText}</Text>"</Text>
        <TouchableOpacity style={styles.refineRow}>
          <Ionicons name="options-outline" size={16} color="#4f5ef7" />
          <Text style={styles.refineText}>Refine</Text>
        </TouchableOpacity>
      </View>
      {/* Search Results */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 16 }}>
        {filteredResults.map((item) => (
          <SearchResultCard key={item.id} item={item} />
        ))}
      </ScrollView>
      {/* Bottom tab bar will be added here */}
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eee',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 16,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    marginLeft: 8,
    paddingVertical: 6,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#4f5ef7',
  },
  filterText: {
    color: '#888',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 2,
    marginBottom: 2,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
    letterSpacing: 1,
  },
  clearText: {
    color: '#4f5ef7',
    fontWeight: 'bold',
    fontSize: 13,
  },
  recentChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 2,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 6,
  },
  recentChipText: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 2,
  },
  resultsForText: {
    color: '#888',
    fontSize: 13,
  },
  refineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refineText: {
    color: '#4f5ef7',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 2,
  },
});

export default SearchScreen;