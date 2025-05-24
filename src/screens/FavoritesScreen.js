import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, ActionSheetIOS, Platform } from 'react-native';
import Header from '../components/Header';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import PaperItem from '../components/PaperItem';
import * as FileSystem from 'expo-file-system';

const filters = [
  { label: 'All', active: true },
  { label: 'Journal' },
  { label: 'Conference' },
  { label: 'Book' },
  { label: 'Preprint' },
];

const FavoritesScreen = ({ navigation }) => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Load papers from AsyncStorage when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const loadPapers = async () => {
        try {
          const savedPapers = await AsyncStorage.getItem('papers');
          if (savedPapers) {
            const parsedPapers = JSON.parse(savedPapers);
            // Filter only starred papers
            const starredPapers = parsedPapers.filter(paper => paper.starred);
            setPapers(starredPapers);
          }
        } catch (error) {
          console.error('Error loading papers:', error);
        } finally {
          setLoading(false);
        }
      };
      loadPapers();
    }, [])
  );

  // Toggle star handler
  const toggleStar = async (id) => {
    try {
      const updatedPapers = papers.map(paper =>
        paper.id === id ? { ...paper, starred: !paper.starred } : paper
      );
      setPapers(updatedPapers.filter(paper => paper.starred));
      
      // Update in AsyncStorage
      const allPapers = await AsyncStorage.getItem('papers');
      if (allPapers) {
        const parsedAllPapers = JSON.parse(allPapers);
        const updatedAllPapers = parsedAllPapers.map(paper =>
          paper.id === id ? { ...paper, starred: !paper.starred } : paper
        );
        await AsyncStorage.setItem('papers', JSON.stringify(updatedAllPapers));
      }
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  // Download handler
  const handleDownload = async (item) => {
    try {
      if (!item.pdfUrl) {
        Alert.alert('Error', 'No PDF URL available for this paper.');
        return;
      }

      const fileName = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      const downloadResumable = FileSystem.createDownloadResumable(
        item.pdfUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          console.log(`Download progress: ${progress * 100}%`);
        }
      );

      const { uri } = await downloadResumable.downloadAsync();
      
      // Update the paper's localUri in the state
      const updatedPapers = papers.map(paper => 
        paper.id === item.id ? { ...paper, localUri: uri } : paper
      );
      setPapers(updatedPapers);
      await AsyncStorage.setItem('papers', JSON.stringify(updatedPapers));
      
      Alert.alert('Success', 'PDF downloaded successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to download PDF: ' + error.message);
    }
  };

  // Open PDF handler
  const handleOpenPDF = async (item) => {
    try {
      if (!item.pdfUrl && !item.localUri) {
        Alert.alert('Error', 'No PDF available for this paper.');
        return;
      }

      let uriToOpen = item.localUri;
      if (!uriToOpen && item.pdfUrl) {
        // If no local copy exists, download it
        const fileName = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        
        const downloadResumable = FileSystem.createDownloadResumable(
          item.pdfUrl,
          fileUri,
          {},
          (downloadProgress) => {
            const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
            console.log(`Download progress: ${progress * 100}%`);
          }
        );

        const { uri } = await downloadResumable.downloadAsync();
        uriToOpen = uri;

        // Update the paper's localUri in the state
        const updatedPapers = papers.map(paper => 
          paper.id === item.id ? { ...paper, localUri: uri } : paper
        );
        setPapers(updatedPapers);
        await AsyncStorage.setItem('papers', JSON.stringify(updatedPapers));
      }

      navigation.navigate('PDFViewer', { uri: uriToOpen, title: item.title });
    } catch (error) {
      Alert.alert('Error', 'Failed to open PDF: ' + error.message);
    }
  };

  // More handler
  const handleMore = (item) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Details', 'Move', 'Delete', item.readStatus === 'read' ? 'Mark as Unread' : 'Mark as Read'],
          destructiveButtonIndex: 3,
          cancelButtonIndex: 0,
          title: item.title,
        },
        buttonIndex => {
          if (buttonIndex === 1) {
            navigation.navigate('PaperDetail', { paper: item });
          }
          if (buttonIndex === 2) {
            // Handle move
          }
          if (buttonIndex === 3) {
            // Handle delete
          }
          if (buttonIndex === 4) {
            // Handle read status
          }
        }
      );
    } else {
      Alert.alert(
        item.title,
        '',
        [
          {
            text: 'Details',
            onPress: () => navigation.navigate('PaperDetail', { paper: item }),
          },
          {
            text: 'Move',
            onPress: () => {
              // Handle move
            },
          },
          { text: 'Delete', onPress: () => {
            // Handle delete
          }, style: 'destructive' },
          {
            text: item.readStatus === 'read' ? 'Mark as Unread' : 'Mark as Read',
            onPress: () => {
              // Handle read status
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  // Filter papers based on search query and active filter
  const getFilteredPapers = () => {
    let filtered = papers;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(paper =>
        paper.title.toLowerCase().includes(query) ||
        paper.authors.toLowerCase().includes(query)
      );
    }
    
    // Apply type filter
    if (activeFilter !== 'All') {
      filtered = filtered.filter(paper => paper.type === activeFilter);
    }
    
    return filtered;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f5ef7" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fafbfc' }}>
      <Header title="Favorites" />
      <View style={styles.searchRow}>
        <Ionicons name="search" size={20} color="#bbb" style={{ marginLeft: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search favorites..."
          placeholderTextColor="#bbb"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterIcon}>
          <Ionicons name="options-outline" size={20} color="#4f5ef7" />
        </TouchableOpacity>
      </View>
      <View style={styles.filterBar}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.label}
            style={[styles.filterChip, activeFilter === filter.label && styles.filterChipActive]}
            onPress={() => setActiveFilter(filter.label)}
          >
            <Text style={[styles.filterText, activeFilter === filter.label && styles.filterTextActive]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={getFilteredPapers()}
        renderItem={({ item }) => (
          <PaperItem
            item={item}
            onPress={() => handleOpenPDF(item)}
            onStar={() => toggleStar(item.id)}
            onDownload={() => handleDownload(item)}
            onMore={() => handleMore(item)}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No favorite papers yet</Text>
            <Text style={styles.emptySubText}>Star papers in your library to see them here</Text>
          </View>
        }
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default FavoritesScreen;