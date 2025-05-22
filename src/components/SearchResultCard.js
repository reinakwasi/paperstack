import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const defaultAvatar = 'https://randomuser.me/api/portraits/men/32.jpg';

const SearchResultCard = ({ item, type }) => {
  const renderArticleCard = () => (
    <View style={styles.card}>
      <View style={styles.articleHeader}>
        <View style={[styles.tag, { backgroundColor: item.tagColor + '22' }]}>
          <Text style={[styles.tagText, { color: item.tagColor }]}>{item.tag}</Text>
        </View>
        {item.open && (
          <View style={[styles.tag, { backgroundColor: '#2ecc7122' }]}>
            <Text style={[styles.tagText, { color: '#2ecc71' }]}>Open Access</Text>
          </View>
        )}
      </View>
      <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.authors} numberOfLines={1}>{item.authors}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{item.journal}</Text>
        <Text style={styles.metaText}>•</Text>
        <Text style={styles.metaText}>{item.year}</Text>
        {item.citations > 0 && (
          <>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>{item.citations} citations</Text>
          </>
        )}
      </View>
      {item.abstract && (
        <Text style={styles.abstract} numberOfLines={2}>{item.abstract}</Text>
      )}
    </View>
  );

  const renderAuthorCard = () => (
    <View style={styles.card}>
      <View style={styles.authorHeader}>
        <Image source={{ uri: item.avatar }} style={styles.authorAvatar} />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{item.name}</Text>
          <Text style={styles.affiliation}>{item.affiliation}</Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.paperCount}</Text>
          <Text style={styles.statLabel}>Papers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.citationCount}</Text>
          <Text style={styles.statLabel}>Citations</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.hIndex}</Text>
          <Text style={styles.statLabel}>h-index</Text>
        </View>
      </View>
    </View>
  );

  const renderJournalCard = () => (
    <View style={styles.card}>
      <View style={styles.journalHeader}>
        <MaterialCommunityIcons name="book-outline" size={24} color={item.tagColor} />
        <View style={styles.journalInfo}>
          <Text style={styles.journalName}>{item.name}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Impact Factor: {item.impact}</Text>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>{item.paperCount} papers</Text>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>{item.citationCount} citations</Text>
          </View>
        </View>
      </View>
    </View>
  );

  switch (type) {
    case 'article':
      return renderArticleCard();
    case 'author':
      return renderAuthorCard();
    case 'journal':
      return renderJournalCard();
    default:
      return renderArticleCard();
  }
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  articleHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  authors: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 13,
    color: '#888',
    marginRight: 4,
  },
  abstract: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    lineHeight: 18,
  },
  authorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  affiliation: {
    fontSize: 13,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  journalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  journalInfo: {
    flex: 1,
    marginLeft: 12,
  },
  journalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
});

export default SearchResultCard; 