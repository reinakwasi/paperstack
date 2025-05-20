import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  const importMethods = [
    { icon: 'file-upload-outline', label: 'Upload PDF' },
    { icon: 'link-variant', label: 'Add by DOI' },
    { icon: 'magnify', label: 'Search Title' },
  ];

  const collections = ['All Papers', 'Favorites', 'Recent Reads', 'Work', 'Research'];

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
      
      // If PDF was selected, copy it to permanent storage
      if (pdfFile) {
        const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.pdf`;
        const newPath = FileSystem.documentDirectory + fileName;
        
        await FileSystem.copyAsync({
          from: pdfFile.uri,
          to: newPath,
        });
        
        localUri = newPath;
        pdfUrl = newPath; // Set both to ensure compatibility
      }

      // Create new paper object
      const newPaper = {
        id: Date.now().toString(),
        title,
        authors: authors || 'Unknown Author',
        source: journal || 'Unknown Journal',
        year: year || new Date().getFullYear().toString(),
        pages: 'Unknown',
        tag: localUri ? 'Local' : (doi ? 'DOI' : 'Manual'),
        tagColor: localUri ? '#9b59b6' : (doi ? '#3498db' : '#f39c12'),
        starred: false,
        readStatus: 'Unread',
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
      
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
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
        
        {/* Form Fields */}
        <View style={styles.formCard}>
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
            placeholder="e.g. 10.1000/xyz123"
            placeholderTextColor="#bbb"
            value={doi}
            onChangeText={setDoi}
          />
          
          <TextInput
            style={styles.input}
            placeholder="e.g. Work,Money,etc"
            placeholderTextColor="#bbb"
            value={tags}
            onChangeText={setTags}
          />
        </View>
        
        {/* File Attachment */}
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
        
        {/* Collection Selection */}
        <View style={styles.collectionRow}>
          <View style={styles.collectionBox}>
            <Ionicons name="folder-outline" size={20} color="#4f5ef7" />
            <Text style={styles.collectionText}>{collection}</Text>
          </View>
          <TouchableOpacity onPress={showCollectionPicker}>
            <Text style={styles.chooseAction}>Change</Text>
          </TouchableOpacity>
        </View>
        
        {/* Add Paper Button */}
        <TouchableOpacity 
          style={[styles.addPaperButton, isSubmitting && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.addPaperButtonText}>
            {isSubmitting ? 'Adding...' : 'Add Paper'}
          </Text>
        </TouchableOpacity>
        
        {/* Cancel Button */}
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
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
});

export default AddPaperScreen;