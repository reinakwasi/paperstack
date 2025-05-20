// src/screens/FoldersScreen.js
import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const myFolders = [
  { id: '1', name: 'Project Z', updated: '2 days ago', color: '#FFA726', count: 14, icon: 'folder' },
  { id: '2', name: 'Project X', updated: '1h ago', color: '#42A5F5', count: 6, icon: 'folder' },
  { id: '3', name: 'Literature Review', updated: '5d ago', color: '#EC407A', count: 25, icon: 'folder' },
  { id: '4', name: 'Personal', updated: '3w ago', color: '#26A69A', count: 3, icon: 'folder' },
  { id: '5', name: '2024 Papers', updated: '2mo ago', color: '#7E57C2', count: 8, icon: 'folder' },
];

const sharedFolders = [
  { id: '6', name: 'Lab Group', sharedBy: 'Alex', updated: '4d ago', color: '#FFD600', count: 11, avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: '7', name: 'Collab Workspace', sharedBy: 'Maria', updated: '2w ago', color: '#00B8D4', count: 19, avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
];

const FoldersScreen = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#fafbfc' }}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Folders</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={{ marginRight: 12 }}>
            <Ionicons name="search" size={22} color="#222" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={22} color="#222" />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* My Folders Section */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>MY FOLDERS</Text>
          <TouchableOpacity style={styles.newButton}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.newButtonText}>New</Text>
          </TouchableOpacity>
        </View>
        {myFolders.map(folder => (
          <View key={folder.id} style={styles.folderCard}>
            <MaterialCommunityIcons name={folder.icon} size={28} color={folder.color} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.folderName}>{folder.name}</Text>
              <Text style={styles.folderUpdated}>Last updated {folder.updated}</Text>
            </View>
            <Text style={styles.folderCount}>{folder.count}</Text>
          </View>
        ))}
        {/* Shared With Me Section */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>SHARED WITH ME</Text>
          <TouchableOpacity style={styles.inviteButton}>
            <Ionicons name="person-add" size={16} color="#222" />
            <Text style={styles.inviteButtonText}>Invite</Text>
          </TouchableOpacity>
        </View>
        {sharedFolders.map(folder => (
          <View key={folder.id} style={styles.folderCard}>
            {folder.avatar ? (
              <Image source={{ uri: folder.avatar }} style={styles.avatar} />
            ) : (
              <MaterialCommunityIcons name="folder" size={28} color={folder.color} style={{ marginRight: 12 }} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.folderName}>{folder.name}</Text>
              <Text style={styles.folderSharedBy}>Shared by {folder.sharedBy} • {folder.updated}</Text>
            </View>
            <Text style={styles.folderCount}>{folder.count}</Text>
          </View>
        ))}
      </ScrollView>
      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
      {/* Bottom tab bar will be added here */}
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
    letterSpacing: 1,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4f5ef7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  newButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 13,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  inviteButtonText: {
    color: '#222',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 13,
  },
  folderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  folderName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  folderUpdated: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  folderSharedBy: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  folderCount: {
    color: '#bbb',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    backgroundColor: '#4f5ef7',
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: '#eee',
  },
});

export default FoldersScreen;