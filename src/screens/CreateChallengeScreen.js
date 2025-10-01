import { useState } from 'react';
import { Animated, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useFadeIn, useSlideUp, useSpringScale } from '../hooks/useAnimations';
import CreateChallengeFormScreen from './CreateChallengeFormScreen';

const CreateChallengeScreen = () => {
  const fadeAnim = useFadeIn(500);
  const slideAnim = useSlideUp(50, 500);
  const [modalVisible, setModalVisible] = useState(false);
  const [scaleAnim, triggerAnimation] = useSpringScale(1);

  const followers = [
    { username: '@frankvecchie', profile_image_url: 'https://example.com/frank.jpg' },
    { username: '@mattbraun', profile_image_url: 'https://example.com/matt.jpg' },
  ];

  const renderFollower = ({ item }) => (
    <TouchableOpacity style={styles.friendItem}>
      <Image source={{ uri: item.profile_image_url }} style={styles.avatar} />
      <Text style={styles.username} numberOfLines={1}>{item.username}</Text>
    </TouchableOpacity>
  );

  const handleCreatePress = () => {
    triggerAnimation();
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        {/* Header content */}
      </Animated.View>

      <Animated.View style={[styles.buttonsRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity style={styles.button}>Achievements</TouchableOpacity>
        <TouchableOpacity style={styles.button}>Copy Referral Link</TouchableOpacity>
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <TouchableOpacity
          style={[styles.createButton, { transform: [{ scale: scaleAnim }] }]}
          onPress={handleCreatePress}
          activeOpacity={0.8} // Native opacity for extra fluidity
        >
          <Text style={styles.createText}>Create New Challenge</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.sectionTitle}>1v1 Your Best Friends</Text>
        <FlatList
          data={followers}
          renderItem={renderFollower}
          keyExtractor={(item) => item.username}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.friendsList}
        />
      </Animated.View>

      <CreateChallengeFormScreen isVisible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
};

// Styles unchanged
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center' },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 20 },
  button: { backgroundColor: '#2A2A2A', padding: 10, borderRadius: 20, flex: 1, marginHorizontal: 5 },
  createButton: {
    backgroundColor: '#3A3A3A',
    padding: 20,
    margin: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  createText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  section: { padding: 20 },
  sectionTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  friendsList: { paddingVertical: 10 },
  friendItem: { alignItems: 'center', marginRight: 15 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 5 },
  username: { color: 'white', fontSize: 12, textAlign: 'center' },
});

export default CreateChallengeScreen;
