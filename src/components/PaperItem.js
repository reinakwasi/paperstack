import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PaperItem = ({ item, onPress, onStar, onDownload, onMore, isSelected }) => {
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
    <View style={[
      styles.container,
      isSelected && styles.selectedContainer
    ]}>
      <TouchableOpacity 
        style={styles.content} 
        onPress={handlePress}
      >
        <View style={styles.leftContent}>
          {isSelected && (
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#4f5ef7" />
            </View>
          )}
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.authors} numberOfLines={1}>
              {item.authors}
            </Text>
            <Text style={styles.journal}>
              {item.journal} • {item.year}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onStar(item.id)} style={styles.actionButton}>
            <Ionicons 
              name={item.starred ? "star" : "star-outline"} 
              size={20} 
              color={item.starred ? "#FFD700" : "#666"} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDownload} style={styles.actionButton}>
            <Ionicons name="download-outline" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onMore(item)} style={styles.actionButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  selectedContainer: {
    backgroundColor: '#f0f2ff',
    borderColor: '#4f5ef7',
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    padding: 16,
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkmarkContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  authors: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  journal: {
    fontSize: 12,
    color: '#888',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
});

export default PaperItem;