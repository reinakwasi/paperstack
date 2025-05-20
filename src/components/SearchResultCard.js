import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const defaultAvatar = 'https://randomuser.me/api/portraits/men/32.jpg';

const SearchResultCard = ({ item }) => {
  if (item.type === 'Article') {
    return (
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <View style={[styles.tag, { backgroundColor: '#4f5ef7' }]}> 
            <Text style={styles.tagText}>Article</Text>
          </View>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.authors}  •  {item.journal}  •  {item.year}</Text>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
          <Ionicons name="open-outline" size={18} color="#4f5ef7" style={{ marginRight: 4 }} />
          <Text style={styles.openText}>Open</Text>
        </TouchableOpacity>
        <Ionicons name="bookmark-outline" size={20} color="#bbb" style={{ position: 'absolute', right: 12, top: 12 }} />
      </View>
    );
  }
  if (item.type === 'Author') {
    return (
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <View style={[styles.tag, { backgroundColor: '#2ecc71' }]}> 
            <Text style={styles.tagText}>Author</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Image source={{ uri: item.avatar || defaultAvatar }} style={styles.avatar} />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.subtitle}>{item.affiliation}</Text>
          </View>
        </View>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <Ionicons name="person-add-outline" size={18} color="#2ecc71" style={{ marginRight: 4 }} />
          <Text style={[styles.openText, { color: '#2ecc71' }]}>Follow</Text>
        </TouchableOpacity>
        <Ionicons name="ellipsis-horizontal" size={20} color="#bbb" style={{ position: 'absolute', right: 12, top: 12 }} />
      </View>
    );
  }
  if (item.type === 'Journal') {
    return (
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <View style={[styles.tag, { backgroundColor: '#f4d03f' }]}> 
            <Text style={[styles.tagText, { color: '#222' }]}>Journal</Text>
          </View>
        </View>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.subtitle}>Impact Factor: {item.impact}</Text>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <MaterialCommunityIcons name="book-open-page-variant-outline" size={18} color="#f4d03f" style={{ marginRight: 4 }} />
          <Text style={[styles.openText, { color: '#f4d03f' }]}>Browse</Text>
        </TouchableOpacity>
        <Ionicons name="ellipsis-horizontal" size={20} color="#bbb" style={{ position: 'absolute', right: 12, top: 12 }} />
      </View>
    );
  }
  return null;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
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
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  subtitle: {
    color: '#444',
    fontSize: 13,
    marginBottom: 2,
  },
  openText: {
    color: '#4f5ef7',
    fontWeight: 'bold',
    fontSize: 14,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eee',
  },
});

export default SearchResultCard; 