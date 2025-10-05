import { useNavigation } from '@react-navigation/native';
import { useContext, useState } from 'react';
import { Animated, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useFadeIn, useSlideUp, useSpringScale } from '../hooks/useAnimations';
import CreateChallengeFormScreen from './CreateChallengeFormScreen';

const CreateChallengeScreen = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const currentBalances = 500; // From context or state
  const fadeAnim = useFadeIn(500);
  const slideAnim = useSlideUp(50, 500);
  const [modalVisible, setModalVisible] = useState(false);
  const [scaleAnim, triggerAnimation] = useSpringScale(1);

  const bestFriends = [
    { username: '@frankvecchie', profile_image_url: 'https://example.com/frank.jpg', record: '10-5', stonesDiff: '+150 🪨' },
    { username: '@mattbraun', profile_image_url: 'https://example.com/matt.jpg', record: '8-7', stonesDiff: '+50 🪨' },
    { username: '@alice_smith', profile_image_url: 'https://example.com/alice.jpg', record: '12-3', stonesDiff: '+200 🪨' },
    { username: '@bob_jones', profile_image_url: 'https://example.com/bob.jpg', record: '9-6', stonesDiff: '-30 🪨' },
  ];

  const renderFollower = ({ item }) => (
    <View style={styles.friendItem}>
      <TouchableOpacity style={styles.createBetIcon} onPress={() => handleCreateWithFriend(item)}>
        <Text style={styles.iconText}>+</Text>
      </TouchableOpacity>
      <Image source={{ uri: item.profile_image_url }} style={styles.avatar} />
      <Text style={styles.username} numberOfLines={1}>{item.username}</Text>
      <Text style={styles.record}>{item.record}</Text>
      <Text style={styles.stonesDiff}>{item.stonesDiff}</Text>
    </View>
  );

  const handleCreateWithFriend = (friend) => {
    setModalVisible(true);
    // Note: Optionally pass friend to form, but for now, pre-fill if form supports initOpponent
  };

  const handleCreatePress = () => {
    triggerAnimation();
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image source={{ uri: user?.profile_image_url || 'https://example.com/default.jpg' }} style={styles.headerAvatar} />
        </TouchableOpacity>
        <Text style={styles.logo}>▲</Text>
        <Text style={styles.stonesText}>{currentBalances} 🪨</Text>
      </Animated.View>

      <Animated.View style={[styles.buttonsRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity style={styles.button}><Text style={styles.buttonText}>Achievements</Text></TouchableOpacity>
        <TouchableOpacity style={styles.button}><Text style={styles.buttonText}>Copy Referral Link</Text></TouchableOpacity>
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
          data={bestFriends}
          renderItem={renderFollower}
          keyExtractor={(item) => item.username}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.friendsList}
        />
      </Animated.View>

      <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Buying Power:</Text>
            <Text style={styles.statValue}>{currentBalances} 🪨</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Frozen Assets:</Text>
            <Text style={styles.statValue}>250 🪨</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Record:</Text>
            <Text style={styles.statValue}>28-19</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Win Rate:</Text>
            <Text style={styles.statValue}>60%</Text>
          </View>
        </View>
      </Animated.View>

      <CreateChallengeFormScreen isVisible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
};

// Styles unchanged
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center' },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  logo: { fontSize: 24, color: 'white' },
  stonesText: { fontSize: 18, color: 'white', fontWeight: 'bold' },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 20 },
  button: { backgroundColor: '#2A2A2A', padding: 10, borderRadius: 20, flex: 1, marginHorizontal: 5 },
  buttonText: { color: 'white', textAlign: 'center' },
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
  createBetIcon: { position: 'absolute', top: 0, right: 0, backgroundColor: 'blue', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  avatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 5 },
  username: { color: 'white', fontSize: 12, textAlign: 'center', marginBottom: 4 },
  record: { color: 'white', fontSize: 10, textAlign: 'center', marginBottom: 2 },
  stonesDiff: { color: 'white', fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
  statsContainer: { marginTop: 10 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statLabel: { color: 'white', fontSize: 16 },
  statValue: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default CreateChallengeScreen;
