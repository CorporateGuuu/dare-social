import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PlaceholderScreen = ({ route }) => {
  const screenName = route.name;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{screenName}</Text>
      <Text style={styles.message}>This screen is under development.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#888',
  },
});

export default PlaceholderScreen;
