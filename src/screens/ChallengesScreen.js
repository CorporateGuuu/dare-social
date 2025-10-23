import Icon from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import React, { useContext, useEffect, useState } from 'react';
import { Animated, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VotingModal from '../components/VotingModal';
import { AuthContext } from '../context/AuthContext';
import { useFadeIn, useSwipeGesture } from '../hooks/useAnimations';
import { submitProof, tallyVotes } from '../utils/votingUtils';

import { useNavigation } from '@react-navigation/native';

const ChallengeCard = React.memo(({ item, onReject, onAccept }) => {
  const { pan, panHandlers } = useSwipeGesture(onReject, onAccept);
  const { user } = useContext(AuthContext);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ translateX: pan.x }],
        },
      ]}
      {...panHandlers}
    >
      <Text style={styles.cardTitle}>{item.title}</Text>
      <View style={styles.opponentRow}>
        <Text style={styles.opponentText}>vs {item.opponent}</Text>
        <Text style={styles.stakesText}>∘ {item.stakes}</Text>
      </View>
      {item.status === 'active' && <Text style={styles.statusText}>Accept by 12:26 PM</Text>}
      {item.status === 'pending' && <Text style={styles.statusText}>Waiting for Opponent</Text>}
      {item.status === 'completed' && (
        <Text style={item.result === 'won' ? styles.wonText : styles.lostText}>
          {item.result === 'won' ? 'You Won' : 'You Lost'}
        </Text>
      )}
    </Animated.View>
  );
});

ChallengeCard.displayName = 'ChallengeCard';

const ChallengesScreen = () => {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const fadeAnim = useFadeIn(500);



  const [challenges, setChallenges] = useState([
    {
      id: '1',
      title: 'The Kings will be better than the Bulls',
      opponent: '@frankvecchie',
      stakes: '25',
      status: 'active',
      dares: [
        'Predict NBA game outcome',
        'Bet on player performance'
      ],
      achievements: ['Sports Analyst'],
      punishment: 'Loser buys dinner',
      involvesBestFriend: false
    },
    {
      id: '2',
      title: 'I will run a marathon',
      opponent: 'Waiting',
      stakes: '25',
      status: 'pending',
      dares: ['Complete full marathon distance'],
      achievements: ['Marathon Runner'],
      punishment: 'Loser submits embarrassing photo',
      involvesBestFriend: false
    },
    {
      id: '3',
      title: 'The Kings won',
      opponent: '@mattbraun',
      stakes: '25',
      status: 'completed',
      result: 'won',
      dares: [
        'Predict game winner',
        'Bet on final score'
      ],
      achievements: ['Sports Analyst', 'Winning Streak'],
      punishment: 'Loser buys lunch for winner',
      involvesBestFriend: true
    },
  ]);

  const [votingModalVisible, setVotingModalVisible] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [proofs, setProofs] = useState([]); // Mock proofs for selected challenge
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // ActivityFeed style states
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'All',
    result: 'All',
    myChallenges: false,
  });

  // Stories data (mock)
  const stories = [
    { id: '1', user: '@willsamrick', image: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: '2', user: '@frankvecchie', image: 'https://randomuser.me/api/portraits/men/2.jpg' },
    { id: '3', user: '@mattbraun', image: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { id: '4', user: '@brendengroess', image: 'https://randomuser.me/api/portraits/men/4.jpg' },
  ];

  // Filter challenges based on search query and advanced filters
  const filteredChallenges = challenges.filter((challenge) => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filters.status === 'All' || challenge.status === filters.status;
    const matchesResult = filters.result === 'All' || challenge.result === filters.result;
    const matchesMyChallenges = !filters.myChallenges || challenge.opponent === '@willsamrick'; // Example: Filter for user's challenges
    return matchesSearch && matchesStatus && matchesResult && matchesMyChallenges;
  });

  useEffect(() => {
    // Handle notification updates for UI
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      try {
        setUnreadNotifications(prev => prev + 1);

        // Highlight challenges with voting alerts
        if (notification?.request?.content?.categoryIdentifier === 'VOTING_ALERT') {
          const data = notification?.request?.content?.data;
          if (data?.challengeId) {
            setChallenges(prevChallenges =>
              prevChallenges.map(c =>
                c.id === data.challengeId.toString()
                  ? { ...c, votingAlert: true }
                  : c
              )
            );
          }
        }
      } catch (error) {
        console.error('Error handling notification:', error);
      }
    });
    return () => subscription.remove();
  }, []);

  const renderChallenge = ({ item }) => {
    // const { pan, panHandlers } = useSwipeGesture(/* callbacks */);

    const handleSubmitProof = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8
      });
      if (result.canceled) return;
      const imageUri = result.assets[0].uri;
      const proofData = { text: 'Mock proof text', image: imageUri };
      await submitProof(item.id, user.id, proofData);
      // Refresh proofs
    };

    const handleOpenVoting = () => {
      setSelectedChallenge(item);
      setProofs([
        { id: 'proof1', user: { username: '@user1' }, text: 'I completed the dare!', image: null, votes: { yes: 2, no: 1 } },
        { id: 'proof2', user: { username: '@user2' }, text: 'Here is my proof', image: 'https://example.com/image.jpg', votes: { yes: 3, no: 0 } },
      ]); // Mock
      setVotingModalVisible(true);
      setTimeout(() => tallyVotes([]), 30000); // Start auto-tally timer after 30 seconds
    };

    const handleOpenChat = () => {
      navigation.navigate('Chat', { challengeId: item.id });
    };

    // Determine border color based on status/result
    let borderColor = '#FF6666'; // default red
    if (item.status === 'completed' && item.result === 'won') borderColor = '#00D4AA';
    else if (item.status === 'completed' && item.result === 'lost') borderColor = '#FF6666';
    else if (item.status === 'active') borderColor = '#FF0000';
    else if (item.status === 'pending') borderColor = '#FF6600';

    return (
      <View style={[styles.card, { borderColor }]}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={styles.opponentRow}>
          <Text style={styles.opponentText}>vs {item.opponent}</Text>
          <Text style={styles.stakesText}>∘ {item.stakes}</Text>
        </View>

        <View style={styles.daresSection}>
          <Text style={styles.sectionTitle}>Dares:</Text>
          {item.dares.map((dare, index) => (
            <Text key={index} style={styles.dareItem}>• {dare}</Text>
          ))}
        </View>

        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements:</Text>
          <View style={styles.achievementsRow}>
            {item.achievements.map((achievement, index) => (
              <Text key={index} style={styles.achievementBadge}>{achievement}</Text>
            ))}
          </View>
        </View>

        <View style={styles.punishmentSection}>
          <Text style={styles.sectionTitle}>Punishment:</Text>
          <Text style={styles.punishmentText}>{item.punishment}</Text>
        </View>

        {item.involvesBestFriend && <Text style={styles.bestFriendBadge}>👥 Best Friend</Text>}

        {item.status === 'completed' && !item.votingActive && (
          <TouchableOpacity style={styles.proofButton} onPress={handleSubmitProof}>
            <Text style={styles.proofText}>Submit Proof</Text>
          </TouchableOpacity>
        )}
        {item.status === 'completed' && item.votingActive && (
          <TouchableOpacity style={styles.actionButton} onPress={handleOpenVoting}>
            <Text style={styles.actionText}>Vote Now</Text>
          </TouchableOpacity>
        )}
        {item.votingAlert && <Text style={styles.alertText}>New Vote Alert!</Text>}
        <TouchableOpacity style={styles.actionButton} onPress={handleOpenChat}>
          <Text style={styles.actionText}>Chat</Text>
        </TouchableOpacity>

        {item.status === 'active' && <Text style={styles.statusText}>Accept by 12:26 PM</Text>}
        {item.status === 'pending' && <Text style={styles.statusText}>Waiting for Opponent</Text>}
        {item.status === 'completed' && (
          <Text style={[styles.result, { color: item.result === 'won' ? '#00D4AA' : '#FF6666' }]}>
            {item.result === 'won' ? 'You Won' : 'You Lost'}
          </Text>
        )}
      </View>
    );
  };

  const Story = ({ story }) => (
    <View style={styles.story}>
      <Image source={{ uri: story.image }} style={styles.storyImage} />
      <Text style={styles.storyUser}>{story.user}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar backgroundColor="#000000" style="light" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>Abstrac</Text>
          <View style={styles.stonesBadge}>
            <Text style={styles.stonesText}>○ {user.stones}</Text>
          </View>
        </View>

        <View style={styles.searchAndFilterContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search challenges..."
              placeholderTextColor="#AAAAAA"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            style={[styles.filterButton, showFilters && styles.filterButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Icon name="funnel" size={18} color={showFilters ? "#000000" : "#FFFFFF"} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Icon name="notifications" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filterPanel}>
            <Text style={styles.filterTitle}>Filter Options</Text>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Status:</Text>
              <Picker
                selectedValue={filters.status}
                style={styles.miniPicker}
                onValueChange={(itemValue) => setFilters({ ...filters, status: itemValue })}
              >
                <Picker.Item label="All" value="All" />
                <Picker.Item label="active" value="active" />
                <Picker.Item label="pending" value="pending" />
                <Picker.Item label="completed" value="completed" />
              </Picker>
            </View>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Result:</Text>
              <Picker
                selectedValue={filters.result}
                style={styles.miniPicker}
                onValueChange={(itemValue) => setFilters({ ...filters, result: itemValue })}
              >
                <Picker.Item label="All" value="All" />
                <Picker.Item label="won" value="won" />
                <Picker.Item label="lost" value="lost" />
              </Picker>
            </View>
            <TouchableOpacity
              style={[styles.myChallengesButton, filters.myChallenges && styles.myChallengesButtonActive]}
              onPress={() => setFilters({ ...filters, myChallenges: !filters.myChallenges })}
            >
              <View style={styles.checkboxRow}>
                <Icon name={filters.myChallenges ? "checkmark-circle" : "ellipse-outline"} size={20} color="#FFFFFF" />
                <Text style={styles.myChallengesText}>My Challenges</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.sectionContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stories}>
            {stories.map((story) => (
              <Story key={story.id} story={story} />
            ))}
          </ScrollView>
        </View>
        <FlatList
          data={filteredChallenges}
          renderItem={renderChallenge}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.feed}
        />
      </View>
      <VotingModal
        isVisible={votingModalVisible}
        onClose={() => setVotingModalVisible(false)}
        challengeId={selectedChallenge?.id}
        proofs={proofs}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
    paddingTop: 10,
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 212, 170, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  stonesBadge: {
    backgroundColor: '#00D4AA',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  stonesText: { color: '#000000', fontSize: 14, fontWeight: 'bold' },

  // Search and Filter Section
  searchAndFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 28,
    paddingHorizontal: 18,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIcon: { fontSize: 18, color: '#777777', marginRight: 10 },
  searchInput: {
    flex: 1,
    height: 45,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
  },
  filterButton: {
    width: 45,
    height: 45,
    backgroundColor: '#1a1a1a',
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonActive: {
    backgroundColor: '#00D4AA',
    borderColor: '#00D4AA',
    shadowColor: '#00D4AA',
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },

  // Filter Panel
  filterPanel: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333333'
  },
  filterTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  filterLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1
  },
  miniPicker: {
    height: 40,
    width: 120,
    color: '#FFFFFF',
    backgroundColor: '#333333',
    borderRadius: 8
  },
  myChallengesButton: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    alignItems: 'center'
  },
  myChallengesButtonActive: { backgroundColor: '#00D4AA' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  myChallengesText: { color: '#00D4AA', fontSize: 16, fontWeight: '600', marginLeft: 8 },

  // Stories Section
  sectionContainer: { marginVertical: 5 },
  stories: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#111111'
  },
  story: { alignItems: 'center', marginRight: 15 },
  storyImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#00D4AA'
  },
  storyUser: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center'
  },

  // Feed
  feed: { paddingHorizontal: 15, paddingTop: 5, paddingBottom: 20 },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Card content styles
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 22,
  },
  opponentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12
  },
  opponentText: { color: '#CCCCCC', fontSize: 14, fontWeight: '500' },
  stakesText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  daresSection: { marginVertical: 14, backgroundColor: '#111111', borderRadius: 10, padding: 12 },
  sectionTitle: { color: '#00D4AA', fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  dareItem: { color: '#CCCCCC', fontSize: 13, marginBottom: 4 },
  achievementsSection: { marginVertical: 12 },
  achievementsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  achievementBadge: {
    backgroundColor: '#333333',
    color: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  punishmentSection: { marginVertical: 12 },
  punishmentText: { color: '#FFA500', fontSize: 14, fontStyle: 'italic' },
  bestFriendBadge: { color: '#FFD700', fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginTop: 12 },
  statusText: { fontSize: 14, textAlign: 'center', marginTop: 12, fontWeight: '600' },
  result: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginTop: 12 },
  alertText: { color: '#00D4AA', fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginTop: 8 },

  // Action buttons
  actionButton: {
    backgroundColor: '#00D4AA',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 12,
    alignSelf: 'center',
    minWidth: 110,
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  proofButton: { backgroundColor: '#00D4AA', borderRadius: 10, padding: 12, marginTop: 12, alignSelf: 'center', minWidth: 110 },
  actionText: {
    color: '#000000',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  proofText: { color: '#000000', fontWeight: '700', fontSize: 14, textAlign: 'center' },
});

export default ChallengesScreen;
