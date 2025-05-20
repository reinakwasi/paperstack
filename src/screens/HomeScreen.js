import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import PaperItem from '../components/PaperItem';

const HomeScreen = ({ navigation }) => {
  const recentPapers = [
    {
      id: '1',
      title: 'Biomedical Image Analysis: A Survey',
      authors: 'Jiawei Chen, Emily Zhang, Michael Wu',
      journal: 'Nature',
      year: '2023',
      pages: '32 pages',
      type: 'Open Access'
    },
    {
      id: '2',
      title: 'Advances in Block and Bar Graphs: A Review',
      authors: 'Ankit Kumar, Sarah Lee',
      journal: 'IEEE',
      year: '2022',
      pages: '18 pages',
      type: 'PDF'
    },
    {
      id: '3',
      title: 'What if humans had tails: A Comprehensive Survey',
      authors: 'Zara Patel, Ivan Popov',
      journal: 'arXiv',
      year: '2024',
      pages: '45 pages',
      type: 'Cited'
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PaperStack</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Library</Text>
        <View style={styles.filterBar}>
          <TouchableOpacity style={styles.filterActive}>
            <Text style={styles.filterActiveText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filter}>
            <Text style={styles.filterText}>Recent</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filter}>
            <Text style={styles.filterText}>Read</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filter}>
            <Text style={styles.filterText}>Unread</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filter}>
            <Text style={styles.filterText}>Cited</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={recentPapers}
        renderItem={({ item }) => (
          <PaperItem 
            item={item}
            onPress={() => navigation.navigate('PaperDetail', { paper: item })}
          />
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  filterBar: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterActive: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterActiveText: {
    color: 'white',
  },
  filter: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterText: {
    color: 'gray',
  },
});

export default HomeScreen;