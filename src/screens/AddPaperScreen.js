import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as Linking from 'expo-linking';

const AddPaperScreen = ({ navigation, route }) => {
  const [importMethod, setImportMethod] = useState(0);
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [journal, setJournal] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [doi, setDoi] = useState('');
  const [tags, setTags] = useState('');
  const [collection, setCollection] = useState('All Papers');
  const [pdfFile, setPdfFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState('Keyword'); // 'Title', 'Author', 'Keyword'

  const importMethods = [
    { icon: 'file-upload-outline', label: 'Upload PDF' },
    { icon: 'link-variant', label: 'Add by DOI' },
    { icon: 'magnify', label: 'Search Title' },
  ];

  const collections = ['All Papers', 'Favorites', 'Recent Reads', 'Work', 'Research'];

  // Search papers using CrossRef and arXiv
  const searchPapers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      let results = [];
      // Build CrossRef query param
      let crossrefParam = '';
      if (searchType === 'Title') crossrefParam = `query.title=${encodeURIComponent(query)}`;
      else if (searchType === 'Author') crossrefParam = `query.author=${encodeURIComponent(query)}`;
      else crossrefParam = `query=${encodeURIComponent(query)}`;
      // Build arXiv query param
      let arxivParam = '';
      if (searchType === 'Title') arxivParam = `ti:${query}`;
      else if (searchType === 'Author') arxivParam = `au:${query}`;
      else arxivParam = `all:${query}`;

      // Search CrossRef with timeout and error handling
      try {
        // For author search, try both query.author and query
        let crossrefResults = [];
        if (searchType === 'Author') {
          // 1. query.author
          const crossrefResponse1 = await Promise.race([
            fetch(
              `https://api.crossref.org/works?query.author=${encodeURIComponent(query)}&rows=10&select=DOI,title,author,published-print,container-title,URL`
            ),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('CrossRef request timeout')), 10000)
            )
          ]);
          if (crossrefResponse1.ok) {
            const crossrefData1 = await crossrefResponse1.json();
            if (crossrefData1.message.items) {
              crossrefResults.push(...crossrefData1.message.items.map(item => ({
                id: item.DOI,
                title: item.title?.[0] || 'Untitled',
                authors: item.author?.map(a => `${a.given} ${a.family}`).join(', ') || 'Unknown',
                journal: item['container-title']?.[0] || 'Unknown Journal',
                year: item['published-print']?.['date-parts']?.[0]?.[0]?.toString() || 'Unknown',
                doi: item.DOI,
                source: 'CrossRef',
                pdfUrl: item.URL
              })));
            }
          }
          // 2. query (general)
          const crossrefResponse2 = await Promise.race([
            fetch(
              `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=10&select=DOI,title,author,published-print,container-title,URL`
            ),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('CrossRef request timeout')), 10000)
            )
          ]);
          if (crossrefResponse2.ok) {
            const crossrefData2 = await crossrefResponse2.json();
            if (crossrefData2.message.items) {
              crossrefResults.push(...crossrefData2.message.items.map(item => ({
                id: item.DOI,
                title: item.title?.[0] || 'Untitled',
                authors: item.author?.map(a => `${a.given} ${a.family}`).join(', ') || 'Unknown',
                journal: item['container-title']?.[0] || 'Unknown Journal',
                year: item['published-print']?.['date-parts']?.[0]?.[0]?.toString() || 'Unknown',
                doi: item.DOI,
                source: 'CrossRef',
                pdfUrl: item.URL
              })));
            }
          }
          // Remove duplicates by DOI
          const seen = new Set();
          crossrefResults = crossrefResults.filter(item => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });
          results.push(...crossrefResults);
        } else {
          const crossrefResponse = await Promise.race([
            fetch(
              `https://api.crossref.org/works?${crossrefParam}&rows=10&select=DOI,title,author,published-print,container-title,URL`
            ),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('CrossRef request timeout')), 10000)
            )
          ]);
          if (crossrefResponse.ok) {
            const crossrefData = await crossrefResponse.json();
            if (crossrefData.message.items) {
              results.push(...crossrefData.message.items.map(item => ({
                id: item.DOI,
                title: item.title?.[0] || 'Untitled',
                authors: item.author?.map(a => `${a.given} ${a.family}`).join(', ') || 'Unknown',
                journal: item['container-title']?.[0] || 'Unknown Journal',
                year: item['published-print']?.['date-parts']?.[0]?.[0]?.toString() || 'Unknown',
                doi: item.DOI,
                source: 'CrossRef',
                pdfUrl: item.URL
              })));
            }
          }
        }
      } catch (crossrefError) {
        console.warn('CrossRef search failed:', crossrefError);
      }
      // Search arXiv with timeout and error handling
      try {
        const arxivResponse = await Promise.race([
          fetch(
            `https://export.arxiv.org/api/query?search_query=${arxivParam}&start=0&max_results=10&sortBy=relevance&sortOrder=descending`
          ),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('arXiv request timeout')), 10000)
          )
        ]);
        if (arxivResponse.ok) {
          const arxivData = await arxivResponse.text();
          // Simple text parsing for arXiv results
          const entries = arxivData.split('<entry>').slice(1);
          entries.forEach((entry, index) => {
            const idMatch = entry.match(/<id>(.*?)<\/id>/);
            const titleMatch = entry.match(/<title>(.*?)<\/title>/);
            const authorsMatch = entry.match(/<author>.*?<name>(.*?)<\/name>.*?<\/author>/g);
            const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
            const id = idMatch ? idMatch[1] : `arxiv-${index}`;
            const title = titleMatch ? titleMatch[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>') : 'Untitled';
            const authors = authorsMatch ? authorsMatch.map(a => a.match(/<name>(.*?)<\/name>/)[1]).join(', ') : 'Unknown';
            const published = publishedMatch ? publishedMatch[1] : null;
            // Extract arXiv ID and construct proper PDF URL
            let pdfUrl = null;
            if (idMatch) {
              const arxivId = idMatch[1].split('/').pop();
              pdfUrl = `https://arxiv.org/pdf/${arxivId}.pdf`;
            }
            results.push({
              id,
              title,
              authors,
              journal: 'arXiv',
              year: published ? new Date(published).getFullYear().toString() : 'Unknown',
              source: 'arXiv',
              pdfUrl
            });
          });
        }
      } catch (arxivError) {
        console.warn('arXiv search failed:', arxivError);
      }
      if (results.length === 0) {
        Alert.alert('No Results', 'No papers found matching your search query. Try different spellings or search by title/keyword.');
      }
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Failed to search papers. Please check your internet connection and try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle paper selection from search results
  const handlePaperSelect = async (paper) => {
    // One-Tap Add: immediately add the paper to the library
    setIsSubmitting(true);
    try {
      let pdfUrl = null;
      let localUri = null;
      let paperTag = 'Remote';
      let paperTagColor = '#3498db';
      let title = paper.title;
      let authors = paper.authors;
      let journal = paper.journal;
      let year = paper.year;
      let doi = paper.doi || '';
      // Validate PDF URL before downloading
      if (!paper.pdfUrl || !paper.pdfUrl.startsWith('http') || !paper.pdfUrl.endsWith('.pdf')) {
        setIsSubmitting(false);
        // Option 3: Offer to open publisher's page if available
        if (paper.doi || paper.id || paper.pdfUrl || paper.URL) {
          let publisherUrl = paper.URL || paper.pdfUrl || (paper.doi ? `https://doi.org/${paper.doi}` : null) || paper.id;
          Alert.alert(
            'No Downloadable PDF',
            "This paper does not have a downloadable PDF. Would you like to open the publisher's page?",
            [
              publisherUrl ? { text: 'Open Page', onPress: () => Linking.openURL(publisherUrl) } : null,
              { text: 'Cancel', style: 'cancel' }
            ].filter(Boolean)
          );
        } else {
          Alert.alert('No Downloadable PDF', 'This paper does not have a downloadable PDF or publisher page.');
        }
        return;
      }
      // Download PDF if available
      if (paper.pdfUrl) {
        const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.pdf`;
        const newPath = FileSystem.documentDirectory + fileName;
        const downloadResumable = FileSystem.createDownloadResumable(
          paper.pdfUrl,
          newPath,
          {},
          (downloadProgress) => {
            const { totalBytesWritten, totalBytesExpectedToWrite } = downloadProgress;
            if (totalBytesExpectedToWrite > 0) {
              const progress = totalBytesWritten / totalBytesExpectedToWrite;
              console.log(`Download progress: ${progress * 100}%`);
            } else {
              console.log('Download progress: unknown total size');
            }
          }
        );
        const { uri } = await downloadResumable.downloadAsync();
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) {
          Alert.alert('Error', 'Failed to download PDF. The file does not exist.');
          setIsSubmitting(false);
          return;
        }
        const fileContent = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8, length: 5 });
        if (!fileContent.startsWith('%PDF-')) {
          Alert.alert('Error', 'Downloaded file is not a valid PDF.');
          setIsSubmitting(false);
          return;
        }
        localUri = uri;
        pdfUrl = paper.pdfUrl;
      }
      // Create new paper object
      const newPaper = {
        id: Date.now().toString(),
        title,
        authors: authors || 'Unknown Author',
        source: journal || 'Unknown Journal',
        year: year || new Date().getFullYear().toString(),
        pages: 'Unknown',
        tag: paperTag,
        tagColor: paperTagColor,
        starred: false,
        readStatus: 'unread',
        pdfUrl,
        localUri,
        collection,
        addedDate: new Date().toISOString(),
        doi,
      };
      // Use AsyncStorage to save papers
      const savedPapers = await AsyncStorage.getItem('papers');
      let existingPapers = [];
      if (savedPapers) {
        existingPapers = JSON.parse(savedPapers);
      }
      const updatedPapers = [newPaper, ...existingPapers];
      await AsyncStorage.setItem('papers', JSON.stringify(updatedPapers));
      setIsSubmitting(false);
      Alert.alert('Success', 'Paper added successfully');
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('LibraryScreen');
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error adding paper from search:', error);
      Alert.alert('Error', 'Failed to add paper: ' + error.message);
    }
  };

  // Handle DOI lookup
  const handleDoiLookup = async () => {
    if (!doi) {
      Alert.alert('Error', 'Please enter a DOI');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://api.crossref.org/works/${doi}`);
      if (!response.ok) {
        throw new Error('DOI not found');
      }

      const data = await response.json();
      const work = data.message;

      // Update form fields with fetched data
      setTitle(work.title?.[0] || '');
      setAuthors(work.author?.map(a => `${a.given} ${a.family}`).join(', ') || '');
      setJournal(work['container-title']?.[0] || '');
      setYear(work.published?.['date-parts']?.[0]?.[0]?.toString() || new Date().getFullYear().toString());

      // If there's a PDF link, set it
      if (work.link?.some(l => l.contentType === 'application/pdf')) {
        const pdfLink = work.link.find(l => l.contentType === 'application/pdf');
        if (pdfLink) {
          setPdfFile({ uri: pdfLink.URL, name: `${work.title[0]}.pdf` });
        }
      }

      Alert.alert('Success', 'Paper details fetched successfully');
    } catch (error) {
      console.error('DOI lookup error:', error);
      Alert.alert('Error', 'Failed to fetch paper details: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle PDF selection
  const handlePickPDF = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ 
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      console.log('DocumentPicker result:', res); // Debug log
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setPdfFile(res.assets[0]);
        if (!title) {
          setTitle(res.assets[0].name.replace('.pdf', ''));
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick PDF: ' + error.message);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!title) {
      Alert.alert('Error', 'Please enter a title for the paper');
      return;
    }

    setIsSubmitting(true);

    try {
      let pdfUrl = null;
      let localUri = null;
      let paperTag = null;
      let paperTagColor = null;
      
      // If PDF was selected, handle it appropriately
      if (pdfFile) {
        const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.pdf`;
        const newPath = FileSystem.documentDirectory + fileName;
        
        // If the PDF is from a URL, download it first
        if (pdfFile.uri.startsWith('http')) {
          const downloadResumable = FileSystem.createDownloadResumable(
            pdfFile.uri,
            newPath,
            {},
            (downloadProgress) => {
              const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
              console.log(`Download progress: ${progress * 100}%`);
            }
          );
          
          const { uri } = await downloadResumable.downloadAsync();
          // Check if file exists after download
          const fileInfo = await FileSystem.getInfoAsync(uri);
          if (!fileInfo.exists) {
            Alert.alert('Error', 'Failed to download PDF. The file does not exist.');
            setIsSubmitting(false);
            return;
          }
          // Check if file is a valid PDF
          const fileContent = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8, length: 5 });
          if (!fileContent.startsWith('%PDF-')) {
            Alert.alert('Error', 'Downloaded file is not a valid PDF.');
            setIsSubmitting(false);
            return;
          }
          localUri = uri;
          pdfUrl = pdfFile.uri;
          paperTag = 'Remote';
          paperTagColor = '#3498db';
        } else {
          // If it's a local file, just copy it
          await FileSystem.copyAsync({
            from: pdfFile.uri,
            to: newPath,
          });
          localUri = newPath;
          pdfUrl = newPath;
          paperTag = 'Local';
          paperTagColor = '#9b59b6';
        }
      }

      // Create new paper object
      const newPaper = {
        id: Date.now().toString(),
        title,
        authors: authors || 'Unknown Author',
        source: journal || 'Unknown Journal',
        year: year || new Date().getFullYear().toString(),
        pages: 'Unknown',
        tag: typeof paperTag !== 'undefined' ? paperTag : (doi ? 'DOI' : 'Manual'),
        tagColor: typeof paperTagColor !== 'undefined' ? paperTagColor : (doi ? '#3498db' : '#f39c12'),
        starred: false,
        readStatus: 'unread',
        pdfUrl,
        localUri,
        collection,
        addedDate: new Date().toISOString(),
        doi,
      };

      // Use AsyncStorage to save papers
      const savedPapers = await AsyncStorage.getItem('papers');
      let existingPapers = [];
      if (savedPapers) {
        existingPapers = JSON.parse(savedPapers);
      }
      const updatedPapers = [newPaper, ...existingPapers];
      await AsyncStorage.setItem('papers', JSON.stringify(updatedPapers));
      
      // Navigate back with success
      navigation.goBack();
      Alert.alert('Success', 'Paper added successfully');
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to add paper: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show collection picker
  const showCollectionPicker = () => {
    Alert.alert(
      'Select Collection',
      '',
      collections.map(collection => ({
        text: collection,
        onPress: () => setCollection(collection),
      })),
      { cancelable: true }
    );
  };

  const renderContent = () => (
    <>
      {/* Import Method */}
      <Text style={styles.sectionLabel}>Import Method</Text>
      <View style={styles.importRow}>
        {importMethods.map((m, idx) => (
          <TouchableOpacity
            key={m.label}
            style={[styles.importButton, importMethod === idx && styles.importButtonActive]}
            onPress={() => setImportMethod(idx)}
          >
            <MaterialCommunityIcons 
              name={m.icon} 
              size={28} 
              color={importMethod === idx ? '#4f5ef7' : '#4f5ef7'} 
            />
            <Text style={[styles.importButtonText, importMethod === idx && { color: '#4f5ef7' }]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Only show the form for Upload PDF and Add by DOI */}
      {(importMethod === 0 || importMethod === 1) && (
        <View style={styles.formCard}>
          {importMethod === 1 && (
            <View style={styles.doiRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="Enter DOI (e.g. 10.1000/xyz123)"
                placeholderTextColor="#bbb"
                value={doi}
                onChangeText={setDoi}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.lookupButton}
                onPress={handleDoiLookup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.lookupButtonText}>Lookup</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
          <TextInput
            style={styles.input}
            placeholder="Enter paper title"
            placeholderTextColor="#bbb"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="e.g. John Smith, Alice Doe"
            placeholderTextColor="#bbb"
            value={authors}
            onChangeText={setAuthors}
          />
          <TextInput
            style={styles.input}
            placeholder="e.g. Nature, Science"
            placeholderTextColor="#bbb"
            value={journal}
            onChangeText={setJournal}
          />
          <TextInput
            style={styles.input}
            placeholder="Year"
            placeholderTextColor="#bbb"
            value={year}
            onChangeText={setYear}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="e.g. Work,Money,etc"
            placeholderTextColor="#bbb"
            value={tags}
            onChangeText={setTags}
          />
        </View>
      )}
      {/* Only show search bar and results for Search Title */}
      {importMethod === 2 && (
        <View style={styles.searchContainer}>
          {/* Search type selector */}
          <View style={{ flexDirection: 'row', marginBottom: 8, justifyContent: 'center' }}>
            {['Keyword', 'Title', 'Author'].map(type => (
              <TouchableOpacity
                key={type}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor: searchType === type ? '#4f5ef7' : '#f0f0f0',
                  marginHorizontal: 4,
                }}
                onPress={() => setSearchType(type)}
              >
                <Text style={{ color: searchType === type ? '#fff' : '#222', fontWeight: 'bold' }}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={[styles.input, { marginBottom: 8 }]}
            placeholder="Search paper title, authors, or keywords..."
            placeholderTextColor="#bbb"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              searchPapers(text);
            }}
          />
          {isSearching && (
            <ActivityIndicator style={styles.searchLoading} color="#4f5ef7" />
          )}
          {searchResults.length > 0 && (
            <View style={styles.searchResults}>
              {searchResults.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.searchResultItem}
                  onPress={() => handlePaperSelect(item)}
                >
                  <Text style={styles.searchResultTitle}>{item.title}</Text>
                  <Text style={styles.searchResultAuthors}>{item.authors}</Text>
                  <Text style={styles.searchResultMeta}>
                    {item.journal} • {item.year} • {item.source}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
      {/* File Attachment */}
      {importMethod === 0 && (
        <View style={styles.attachmentRow}>
          <View style={styles.attachmentBox}>
            <Ionicons name="document-attach-outline" size={20} color="#e53935" />
            <Text style={styles.attachmentText} numberOfLines={1}>
              {pdfFile ? pdfFile.name : 'No file chosen'}
            </Text>
          </View>
          <TouchableOpacity onPress={handlePickPDF}>
            <Text style={styles.attachAction}>Attach</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Collection Selection */}
      {(importMethod === 0 || importMethod === 1) && (
        <View style={styles.collectionRow}>
          <View style={styles.collectionBox}>
            <Ionicons name="folder-outline" size={20} color="#4f5ef7" />
            <Text style={styles.collectionText}>{collection}</Text>
          </View>
          <TouchableOpacity onPress={showCollectionPicker}>
            <Text style={styles.chooseAction}>Change</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Add Paper Button */}
      {(importMethod === 0 || importMethod === 1) && (
        <TouchableOpacity 
          style={[styles.addPaperButton, isSubmitting && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.addPaperButtonText}>
            {isSubmitting ? 'Adding...' : 'Add Paper'}
          </Text>
        </TouchableOpacity>
      )}
      {/* Cancel Button */}
      {(importMethod === 0 || importMethod === 1) && (
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Paper</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {/* Progress Dots */}
      <View style={styles.dotsRow}>
        <View style={[styles.dot, { backgroundColor: '#4f5ef7' }]} />
        <View style={[styles.dot, { backgroundColor: '#e0e0e0' }]} />
        <View style={[styles.dot, { backgroundColor: '#e0e0e0' }]} />
      </View>
      
      <FlatList
        data={[1]} // Single item since we're using it as a container
        renderItem={() => renderContent()}
        keyExtractor={() => 'content'}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  sectionLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    marginBottom: 10,
    marginLeft: 2,
  },
  importRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  importButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#f5f7ff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  importButtonActive: {
    backgroundColor: '#e7eaff',
    borderColor: '#4f5ef7',
  },
  importButtonText: {
    marginTop: 6,
    color: '#222',
    fontWeight: 'bold',
    fontSize: 13,
  },
  formCard: {
    backgroundColor: '#fafbfc',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#222',
    marginBottom: 10,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    padding: 12,
    marginBottom: 14,
  },
  attachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  attachmentText: {
    color: '#e53935',
    marginLeft: 6,
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1,
  },
  attachAction: {
    color: '#4f5ef7',
    fontWeight: 'bold',
    fontSize: 14,
  },
  collectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    padding: 12,
    marginBottom: 18,
  },
  collectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  collectionText: {
    color: '#4f5ef7',
    marginLeft: 6,
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1,
  },
  chooseAction: {
    color: '#4f5ef7',
    fontWeight: 'bold',
    fontSize: 14,
  },
  addPaperButton: {
    backgroundColor: '#4f5ef7',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  addPaperButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  cancelButtonText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 16,
  },
  doiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  lookupButton: {
    backgroundColor: '#4f5ef7',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  lookupButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchLoading: {
    marginTop: 8,
  },
  searchResults: {
    maxHeight: 300,
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchResultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  searchResultAuthors: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  searchResultMeta: {
    fontSize: 12,
    color: '#888',
  },
});

export default AddPaperScreen;