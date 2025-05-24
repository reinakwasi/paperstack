import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const profile = {
  name: 'Jordan Lee',
  email: 'jordan.lee@email.com',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
};

const settings = [
  { label: 'Privacy Settings', icon: 'shield-checkmark', color: '#4f8cff' },
  { label: 'Notifications', icon: 'notifications', color: '#ffd600' },
  { label: 'Appearance', icon: 'color-palette', color: '#b47cff' },
  { label: 'Help & Support', icon: 'help-circle', color: '#bdbdbd' },
  { label: 'About PaperStack', icon: 'information-circle', color: '#4f8cff' },
];

const ProfileScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>More</Text>
        <Ionicons name="ellipsis-vertical" size={22} color="#222" />
      </View>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={true}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
            <TouchableOpacity>
              <Text style={styles.viewAccount}>View Account <Ionicons name="chevron-forward" size={14} color="#4f5ef7" /></Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Settings List */}
        <View style={styles.settingsList}>
          {settings.map((item, idx) => (
            <TouchableOpacity 
              key={item.label} 
              style={styles.settingsItem}
              onPress={() => {
                if (item.label === 'About PaperStack') {
                  navigation.navigate('About');
                }
              }}
            >
              <View style={[styles.iconCircle, { backgroundColor: item.color + '22' }]}> 
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.settingsLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color="#bbb" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          ))}
        </View>
        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color="#e53935" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        {/* Version Info */}
        <Text style={styles.version}>v1.4.1 – PaperStack</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    margin: 16,
    marginBottom: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    backgroundColor: '#eee',
  },
  profileName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  profileEmail: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  viewAccount: {
    color: '#4f5ef7',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 2,
  },
  settingsList: {
    backgroundColor: 'transparent',
    marginHorizontal: 8,
    marginBottom: 16,
    flex: 1,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 5,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingsLabel: {
    fontSize: 15,
    color: '#222',
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffeaea',
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  logoutText: {
    color: '#e53935',
    fontWeight: 'bold',
    fontSize: 16,
  },
  version: {
    marginTop: 18,
    textAlign: 'center',
    color: '#bbb',
    fontSize: 13,
  },
});

export default ProfileScreen;