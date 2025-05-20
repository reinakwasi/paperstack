// src/screens/MoreScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const MoreScreen = ({ navigation }) => {
  const menuItems = [
    { title: 'View Account >', subtitle: 'Jordan Lee\njordan.lee@email.com' },
    { title: 'Privacy Settings' },
    { title: 'Notifications' },
    { title: 'Appearance' },
    { title: 'Subscription & Billing' },
    { title: 'Import / Export' },
    { title: 'Help & Support' },
    { title: 'About PaperStack' },
    { title: 'Log Out', color: 'red' },
  ];

  return (
    <View style={styles.container}>
      {menuItems.map((item, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.menuItem}
          onPress={() => {
            if (item.title === 'Log Out') {
              // Handle logout
            }
          }}
        >
          <View>
            {item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
            <Text style={[styles.menuText, item.color && { color: item.color }]}>
              {item.title}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
      <Text style={styles.version}>v1.4.1 – PaperStack</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 4,
  },
  menuText: {
    fontSize: 16,
  },
  version: {
    marginTop: 32,
    textAlign: 'center',
    color: 'gray',
  },
});

export default MoreScreen;