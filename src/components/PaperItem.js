import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PaperItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.type}>{item.type}</Text>
      <Text style={styles.year}>{item.year}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.authors}>{item.authors}</Text>
      <View style={styles.meta}>
        <Text style={styles.journal}>{item.journal}</Text>
        <Text style={styles.pages}>{item.pages}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  type: {
    fontSize: 12,
    color: '#1a73e8',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  year: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  journal: {
    fontSize: 14,
    color: 'gray',
  },
  pages: {
    fontSize: 14,
    color: 'gray',
  },
});

export default PaperItem;