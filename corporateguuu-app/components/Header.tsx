import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

const mockUser = {
  username: '@willsamrick',
  avatar: '😎',
  stones: 10,
};

export default function Header() {
  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.avatarButton}>
        <ThemedText style={styles.avatar}>{mockUser.avatar}</ThemedText>
      </TouchableOpacity>

      <ThemedView style={styles.logoContainer}>
        <ThemedText style={styles.logo}>◢</ThemedText>
      </ThemedView>

      <TouchableOpacity style={styles.balanceButton}>
        <ThemedText style={styles.balance}>∘ {mockUser.stones}</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50, // Accounting for status bar
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  avatar: {
    fontSize: 24,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  balanceButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#007bff',
    backgroundColor: '#007bff',
  },
  balance: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
