import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Header from '../components/Header';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const favorites = [
  {
    id: '1',
    title: 'The secret lives of urban foxes: THE Recognition',
    authors: 'Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun',
    year: '2015',
    venue: 'CVPR',
    type: 'Journal',
    citations: '85,123',
    color: '#4f5ef7',
    icon: 'book-open-variant',
    tag: 'Journal',
    tagColor: '#4f5ef7',
  },
  {
    id: '2',
    title: 'Attention is All You Need',
    authors: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, et al.',
    year: '2017',
    venue: 'NeurIPS',
    type: 'Conference',
    citations: '68,541',
    color: '#2ecc71',
    icon: 'account-group',
    tag: 'Conference',
    tagColor: '#2ecc71',
  },
  {
    id: '3',
    title: 'BERT: Pre-training of Deep Bidirectional Transformers',
    authors: 'Jacob Devlin, Ming-Wei Chang, et al.',
    year: '2019',
    venue: 'NAACL',
    type: 'Preprint',
    citations: '34,110',
    color: '#e84393',
    icon: 'file-document',
    tag: 'Preprint',
    tagColor: '#e84393',
  },
  {
    id: '4',
    title: 'The future of sleep: Do we really need 8 hours?',
    authors: 'Christopher M. Bishop',
    year: '2006',
    venue: 'Book',
    type: 'Book',
    citations: '29,205',
    color: '#2980ef',
    icon: 'book',
    tag: 'Book',
    tagColor: '#2980ef',
  },
];

const filters = [
  { label: 'All', active: true },
  { label: 'Journal' },
  { label: 'Conference' },
  { label: 'Book' },
  { label: 'Preprint' },
];

const FavoritesScreen = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#fafbfc' }}>
      <Header title="Favorites" />
      <View style={styles.searchRow}>
        <Ionicons name="search" size={20} color="#bbb" style={{ marginLeft: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search favorites..."
          placeholderTextColor="#bbb"
        />
        <TouchableOpacity style={styles.filterIcon}>
          <Ionicons name="options-outline" size={20} color="#4f5ef7" />
        </TouchableOpacity>
      </View>
      <View style={styles.filterBar}>
        {filters.map((filter, idx) => (
          <TouchableOpacity
            key={filter.label}
            style={[styles.filterChip, filter.active && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter.active && styles.filterTextActive]}>{filter.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={favorites}
        renderItem={({ item }) => (
          <View style={styles.paperCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name={item.icon} size={24} color={item.color} style={{ marginRight: 8 }} />
              <Text style={styles.paperTitle}>{item.title}</Text>
              <Ionicons name="star-outline" size={22} color="#4f5ef7" style={{ marginLeft: 'auto' }} />
            </View>
            <Text style={styles.paperAuthors}>{item.authors}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <View style={[styles.tag, { backgroundColor: item.tagColor }]}> 
                <Text style={styles.tagText}>{item.tag}</Text>
              </View>
              <Text style={styles.citedText}>Cited by {item.citations}</Text>
            </View>
          </View>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
      {/* Bottom tab bar will be added here */}
    </View>
  );
};

const styles = StyleSheet.create({
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
  filterIcon: {
    padding: 6,
    marginRight: 4,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  filterChip: {
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
  paperCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  paperTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
  },
  paperAuthors: {
    color: '#444',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 2,
  },
  tag: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  tagText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  citedText: {
    color: '#aaa',
    fontSize: 13,
  },
});

export default FavoritesScreen;