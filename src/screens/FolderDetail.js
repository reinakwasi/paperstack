import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PaperItem from '../components/PaperItem';
import { useRoute, useNavigation } from '@react-navigation/native';

const FolderDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { folder } = route.params;
  
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPapers();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const selectedPaper = route.params?.selectedPaper;
      if (selectedPaper) {
        handleAddPaper(selectedPaper);
        navigation.setParams({ selectedPaper: undefined });
      }
    });

    return unsubscribe;
  }, [navigation, route.params]);

  const loadPapers = async () => {
    try {
      setLoading(true);
      // Load all papers from AsyncStorage
      const savedPapers = await AsyncStorage.getItem('papers');
      if (savedPapers) {
        const allPapers = JSON.parse(savedPapers);
        // Filter papers that belong to this folder
        const folderPapers = allPapers.filter(paper => 
          paper.folders && paper.folders.includes(folder.id)
        );
        setPapers(folderPapers);
      }
    } catch (error) {
      console.error('Error loading papers:', error);
      Alert.alert('Error', 'Failed to load papers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaper = async (paper) => {
    try {
      if (papers.some(p => p.id === paper.id)) {
        Alert.alert('Info', 'This paper is already in the folder');
        return;
      }

      const updatedPapers = [...papers, paper];
      setPapers(updatedPapers);

      const savedPapers = await AsyncStorage.getItem('papers');
      if (savedPapers) {
        const allPapers = JSON.parse(savedPapers);
        const updatedAllPapers = allPapers.map(p =>
          p.id === paper.id ? { ...p, folders: [...(p.folders || []), folder.id] } : p
        );
        await AsyncStorage.setItem('papers', JSON.stringify(updatedAllPapers));
      }

      const savedFolders = await AsyncStorage.getItem('my_folders');
      if (savedFolders) {
        const folders = JSON.parse(savedFolders);
        const updatedFolders = folders.map(f =>
          f.id === folder.id ? { ...f, count: f.count + 1 } : f
        );
        await AsyncStorage.setItem('my_folders', JSON.stringify(updatedFolders));
      }
    } catch (error) {
      console.error('Error adding paper to folder:', error);
      Alert.alert('Error', 'Failed to add paper to folder');
    }
  };

  const handleRemovePaper = async (paperId) => {
    try {
      // Remove paper from folder
      const updatedPapers = papers.filter(p => p.id !== paperId);
      setPapers(updatedPapers);

      // Update in AsyncStorage
      const savedPapers = await AsyncStorage.getItem('papers');
      if (savedPapers) {
        const allPapers = JSON.parse(savedPapers);
        const updatedAllPapers = allPapers.map(p =>
          p.id === paperId 
            ? { ...p, folders: (p.folders || []).filter(f => f !== folder.id) }
            : p
        );
        await AsyncStorage.setItem('papers', JSON.stringify(updatedAllPapers));
      }

      // Update folder count
      const savedFolders = await AsyncStorage.getItem('my_folders');
      if (savedFolders) {
        const folders = JSON.parse(savedFolders);
        const updatedFolders = folders.map(f =>
          f.id === folder.id ? { ...f, count: f.count - 1 } : f
        );
        await AsyncStorage.setItem('my_folders', JSON.stringify(updatedFolders));
      }
    } catch (error) {
      console.error('Error removing paper from folder:', error);
      Alert.alert('Error', 'Failed to remove paper from folder');
    }
  };

  const handlePaperPress = (paper) => {
    if (paper.pdfUrl || paper.localUri) {
      navigation.navigate('PDFViewer', { 
        uri: paper.localUri || paper.pdfUrl,
        title: paper.title 
      });
    } else {
      Alert.alert('Error', 'No PDF available for this paper');
    }
  };

  const filteredPapers = papers.filter(paper =>
    paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    paper.authors.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f5ef7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <MaterialCommunityIcons 
            name={folder.icon} 
            size={24} 
            color={folder.color} 
          />
          <Text style={styles.headerTitle}>{folder.name}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Library', { 
          onSelect: (paper) => {
            navigation.setParams({ selectedPaper: paper });
          }
        })}>
          <Ionicons name="add" size={24} color="#222" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#bbb" style={{ marginLeft: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search papers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Papers List */}
      <FlatList
        data={filteredPapers}
        renderItem={({ item }) => (
          <PaperItem
            item={item}
            onPress={() => handlePaperPress(item)}
            onStar={() => {}}
            onDownload={() => {}}
            onMore={() => {
              Alert.alert(
                'Paper Options',
                '',
                [
                  {
                    text: 'Remove from Folder',
                    onPress: () => handleRemovePaper(item.id),
                    style: 'destructive'
                  },
                  {
                    text: 'Cancel',
                    style: 'cancel'
                  }
                ]
              );
            }}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No papers in this folder</Text>
            <Text style={styles.emptySubText}>
              Add papers by tapping the + button
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 8,
  },
  searchBar: {
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
  listContent: {
    paddingBottom: 16,
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

export default FolderDetail; 