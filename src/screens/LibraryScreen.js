import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActionSheetIOS, Platform, Modal, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import PaperItem from '../components/PaperItem';
import { useFocusEffect } from '@react-navigation/native';

const LibraryScreen = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [papers, setPapers] = useState([]);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [collections, setCollections] = useState(['Default', 'Research', 'Favorites']);

  const filters = [
    { label: 'All' },
    { label: 'Recent' },
    { label: 'Read' },
    { label: 'Unread' },
    { label: 'Cited' },
    { label: 'PDF' },
    { label: 'Open Access' },
  ];

  // Load papers from AsyncStorage when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const loadPapers = async () => {
        try {
          const savedPapers = await AsyncStorage.getItem('papers');
          if (savedPapers) {
            setPapers(JSON.parse(savedPapers));
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to load papers.');
        }
      };
      loadPapers();
    }, [])
  );

  // Save papers to AsyncStorage
  useEffect(() => {
    const savePapers = async () => {
      try {
        await AsyncStorage.setItem('papers', JSON.stringify(papers));
      } catch (error) {
        Alert.alert('Error', 'Failed to save papers.');
      }
    };
    if (papers.length > 0) {
      savePapers();
    }
  }, [papers]);

  // Filtering logic
  const filteredPapers = papers.filter(paper => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Cited') return paper.tag === 'Cited';
    if (activeFilter === 'PDF') return paper.tag === 'PDF';
    if (activeFilter === 'Open Access') return paper.tag === 'Open Access';
    if (activeFilter === 'Recent') {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return new Date(paper.addedDate) >= oneWeekAgo;
    }
    if (activeFilter === 'Read') return paper.readStatus === 'Read';
    if (activeFilter === 'Unread') return paper.readStatus === 'Unread';
    return false;
  });

  // Toggle star handler
  const toggleStar = id => {
    setPapers(prevPapers =>
      prevPapers.map(paper =>
        paper.id === id ? { ...paper, starred: !paper.starred } : paper
      )
    );
  };

  // Toggle read status
  const toggleReadStatus = id => {
    setPapers(prevPapers =>
      prevPapers.map(paper =>
        paper.id === id
          ? { ...paper, readStatus: paper.readStatus === 'Read' ? 'Unread' : 'Read' }
          : paper
      )
    );
  };

  // Download handler
  const handleDownload = async item => {
    try {
      if (!item.pdfUrl && !item.localUri) {
        Alert.alert('Error', 'No PDF available for this paper.');
        return;
      }

      // If it's already downloaded locally, no need to download again
      if (item.localUri) {
        Alert.alert('Info', 'PDF is already downloaded.');
        return;
      }

      const fileUri = `${FileSystem.documentDirectory}${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
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
      setPapers(prevPapers =>
        prevPapers.map(paper =>
          paper.id === item.id ? { ...paper, localUri: uri } : paper
        )
      );
      Alert.alert('Success', 'PDF downloaded successfully!');
    } catch (error) {
      Alert.alert('Download Failed', error.message);
    }
  };

  // Open PDF handler
  const handleOpenPDF = async item => {
    try {
      if (!item.pdfUrl && !item.localUri) {
        Alert.alert('Error', 'No PDF available for this paper.');
        return;
      }

      let uri = item.localUri;
      if (!uri) {
        const fileUri = `${FileSystem.documentDirectory}${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        
        if (!fileInfo.exists) {
          // Download the PDF if it's not already downloaded
          const downloadResumable = FileSystem.createDownloadResumable(item.pdfUrl, fileUri);
          const result = await downloadResumable.downloadAsync();
          uri = result.uri;
          setPapers(prevPapers =>
            prevPapers.map(paper =>
              paper.id === item.id ? { ...paper, localUri: uri } : paper
            )
          );
        } else {
          uri = fileUri;
        }
      }

      navigation.navigate('PDFViewer', { uri, title: item.title });
      setPapers(prevPapers =>
        prevPapers.map(paper =>
          paper.id === item.id ? { ...paper, readStatus: 'Read' } : paper
        )
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to open PDF: ' + error.message);
    }
  };

  // More handler
  const handleMore = item => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Details', 'Move', 'Delete', 'Mark as Read/Unread'],
          destructiveButtonIndex: 3,
          cancelButtonIndex: 0,
          title: item.title,
        },
        buttonIndex => {
          if (buttonIndex === 1) {
            setSelectedPaper(item);
            setDetailsModalVisible(true);
          }
          if (buttonIndex === 2) {
            setSelectedPaper(item);
            setMoveModalVisible(true);
          }
          if (buttonIndex === 3) handleDelete(item.id);
          if (buttonIndex === 4) toggleReadStatus(item.id);
        }
      );
    } else {
      Alert.alert(
        item.title,
        '',
        [
          {
            text: 'Details',
            onPress: () => {
              setSelectedPaper(item);
              setDetailsModalVisible(true);
            },
          },
          {
            text: 'Move',
            onPress: () => {
              setSelectedPaper(item);
              setMoveModalVisible(true);
            },
          },
          { text: 'Delete', onPress: () => handleDelete(item.id), style: 'destructive' },
          {
            text: item.readStatus === 'Read' ? 'Mark as Unread' : 'Mark as Read',
            onPress: () => toggleReadStatus(item.id),
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  // Delete handler
  const handleDelete = id => {
    setPapers(prevPapers => prevPapers.filter(paper => paper.id !== id));
  };

  // Move to collection
  const handleMoveToCollection = collection => {
    setPapers(prevPapers =>
      prevPapers.map(paper =>
        paper.id === selectedPaper.id ? { ...paper, collection } : paper
      )
    );
    setMoveModalVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fafbfc' }}>
      <Header />
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>My Library</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddPaper', { setPapers })}
        >
          <Ionicons name="add" size={18} color="#4f5ef7" />
          <Text style={styles.addButtonText}>Add Paper</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.filterBar}>
        {filters.map(filter => (
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
        data={filteredPapers}
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
      />
      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Paper Details</Text>
            {selectedPaper && (
              <>
                <Text style={styles.modalLabel}>Title:</Text>
                <Text style={styles.modalValue}>{selectedPaper.title}</Text>
                <Text style={styles.modalLabel}>Authors:</Text>
                <Text style={styles.modalValue}>{selectedPaper.authors}</Text>
                <Text style={styles.modalLabel}>Source:</Text>
                <Text style={styles.modalValue}>{selectedPaper.source}</Text>
                <Text style={styles.modalLabel}>Year:</Text>
                <Text style={styles.modalValue}>{selectedPaper.year}</Text>
                <Text style={styles.modalLabel}>Pages:</Text>
                <Text style={styles.modalValue}>{selectedPaper.pages}</Text>
                <Text style={styles.modalLabel}>Tag:</Text>
                <Text style={styles.modalValue}>{selectedPaper.tag}</Text>
                <Text style={styles.modalLabel}>Collection:</Text>
                <Text style={styles.modalValue}>{selectedPaper.collection}</Text>
                <Text style={styles.modalLabel}>DOI:</Text>
                <Text style={styles.modalValue}>{selectedPaper.doi || 'N/A'}</Text>
              </>
            )}
            <Pressable style={styles.modalCloseButton} onPress={() => setDetailsModalVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal
        visible={moveModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMoveModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Move Paper</Text>
            {selectedPaper && (
              <>
                <Text style={styles.modalLabel}>Title:</Text>
                <Text style={styles.modalValue}>{selectedPaper.title}</Text>
                <Text style={styles.modalLabel}>Move to Collection:</Text>
                {collections.map(collection => (
                  <TouchableOpacity
                    key={collection}
                    style={styles.collectionButton}
                    onPress={() => handleMoveToCollection(collection)}
                  >
                    <Text style={styles.collectionButtonText}>{collection}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
            <Pressable style={styles.modalCloseButton} onPress={() => setMoveModalVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    color: 'gray',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
    textAlign: 'center',
  },
  modalLabel: {
    fontWeight: 'bold',
    color: '#4f5ef7',
    marginTop: 8,
  },
  modalValue: {
    color: '#222',
    marginBottom: 2,
  },
  modalCloseButton: {
    marginTop: 18,
    backgroundColor: '#4f5ef7',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  collectionButton: {
    backgroundColor: '#e7eaff',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  collectionButtonText: {
    color: '#4f5ef7',
    fontWeight: '500',
  },
});

export default LibraryScreen;