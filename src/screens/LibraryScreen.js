// src/screens/LibraryScreen.js
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
// import PaperItem from '../components/PaperItem'; // Will update this later

const LibraryScreen = ({ navigation }) => {
  const papers = [
    {
      id: '1',
      title: 'Uses of the real Biomedical Image Analysis: A Survey',
      authors: 'Jiawei Chen, Emily Zhang, Michael Wu',
      source: 'Nature',
      year: '2023',
      pages: '32 pages',
      tag: 'Open Access',
      tagColor: '#2ecc71',
    },
    {
      id: '2',
      title: 'Advances in Block and Bar Graphs: A Review',
      authors: 'Ankit Kumar, Sarah Lee',
      source: 'IEEE',
      year: '2022',
      pages: '18 pages',
      tag: 'PDF',
      tagColor: '#f4d03f',
    },
    {
      id: '3',
      title: 'What if humans had tails: A Comprehensive Survey',
      authors: 'Zara Patel, Ivan Popov',
      source: 'arXiv',
      year: '2024',
      pages: '45 pages',
      tag: 'Cited',
      tagColor: '#2980ef',
    },
  ];

  const filters = [
    { label: 'All', active: true },
    { label: 'Recent' },
    { label: 'Read' },
    { label: 'Unread' },
    { label: 'Cited' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#fafbfc' }}>
      <Header />
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>My Library</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={18} color="#4f5ef7" />
          <Text style={styles.addButtonText}>Add Paper</Text>
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
      {/* Placeholder for paper cards */}
      <FlatList
        data={papers}
        renderItem={({ item }) => (
          <View style={styles.paperCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <View style={[styles.tag, { backgroundColor: item.tagColor || '#eee' }]}> 
                <Text style={styles.tagText}>{item.tag}</Text>
              </View>
              <Text style={styles.yearText}>{item.year}</Text>
            </View>
            <Text style={styles.paperTitle}>{item.title}</Text>
            <Text style={styles.paperAuthors}>{item.authors}</Text>
            <Text style={styles.paperSource}>{item.source} | {item.pages}</Text>
            <View style={styles.iconRow}>
              <Ionicons name="star-outline" size={20} color="#aaa" style={{ marginRight: 16 }} />
              <Ionicons name="download-outline" size={20} color="#aaa" style={{ marginRight: 16 }} />
              <Ionicons name="ellipsis-horizontal" size={20} color="#aaa" />
            </View>
          </View>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7eaff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addButtonText: {
    color: '#4f5ef7',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 14,
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
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
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
  yearText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  paperTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  paperAuthors: {
    color: '#444',
    fontSize: 14,
    marginBottom: 2,
  },
  paperSource: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 8,
  },
  iconRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
});

export default LibraryScreen;