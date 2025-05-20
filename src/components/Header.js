import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const defaultAvatar = 'https://randomuser.me/api/portraits/men/32.jpg';

const Header = ({ title = 'PaperStack', onMenuPress, avatarUri }) => (
  <View style={styles.container}>
    <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
      <Ionicons name="menu" size={24} color="#222" />
    </TouchableOpacity>
    <Text style={styles.title}>{title}</Text>
    <Image
      source={{ uri: avatarUri || defaultAvatar }}
      style={styles.avatar}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eee',
  },
});

export default Header;
