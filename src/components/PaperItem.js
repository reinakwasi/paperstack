import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PaperItem = ({ item, onPress, onStar, onDownload, onMore }) => {
  const handleDownload = () => {
    if (!item.pdfUrl) {
      Alert.alert('Error', 'No PDF available for this paper.');
      return;
    }
    onDownload(item);
  };

  const handlePress = () => {
    if (!item.pdfUrl && !item.localUri) {
      Alert.alert('Error', 'No PDF available for this paper.');
      return;
    }
    onPress(item);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
        <View style={[styles.tag, { backgroundColor: item.tagColor || '#eee' }]}>
          <Text style={styles.type}>{item.tag}</Text>
        </View>
        <Text style={styles.year}>{item.year}</Text>
        {item.readStatus?.toLowerCase() === 'read' && (
          <View style={styles.readBadge}>
            <Text style={styles.readText}>Read</Text>
          </View>
        )}
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.authors}>{item.authors}</Text>
      <View style={styles.meta}>
        <Text style={styles.journal}>{item.source}</Text>
        <Text style={styles.pages}>{item.pages}</Text>
      </View>
      <View style={styles.iconRow}>
        <TouchableOpacity onPress={() => onStar(item.id)} style={styles.iconButton}>
          <Ionicons
            name={item.starred ? 'star' : 'star-outline'}
            size={20}
            color={item.starred ? '#FFD600' : '#aaa'}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDownload} style={styles.iconButton}>
          <Ionicons 
            name={item.localUri ? 'checkmark-circle' : 'download-outline'} 
            size={20} 
            color={item.localUri ? '#4f5ef7' : '#aaa'} 
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onMore(item)} style={styles.iconButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#aaa" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 12,
    marginVertical: 8,
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
  type: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  year: {
    fontSize: 12,
    color: 'gray',
    fontWeight: '500',
  },
  readBadge: {
    backgroundColor: '#4f5ef7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  readText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  authors: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  journal: {
    fontSize: 14,
    color: 'gray',
  },
  pages: {
    fontSize: 14,
    color: 'gray',
  },
  iconRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  iconButton: {
    padding: 8,
    marginRight: 8,
  },
});

export default PaperItem;