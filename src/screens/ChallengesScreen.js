import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import React, { useContext, useEffect, useState } from 'react';
import { Animated, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { submitProof, tallyVotes } from '../utils/votingUtils';
import VotingModal from '../components/VotingModal';
import { AuthContext } from '../context/AuthContext';
import { useFadeIn, useSwipeGesture } from '../hooks/useAnimations';


import { useNavigation } from '@react-navigation/native';

const ChallengeCard = React.memo(({ item, onReject, onAccept }) => {
  const { pan, panHandlers } = useSwipeGesture(onReject, onAccept);

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

    return (
      <Animated.View style={[styles.card]}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {item.involvesBestFriend && <Text style={styles.bestFriendBadge}>👥 Best Friend</Text>}
        </View>

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

        {item.status === 'completed' && !item.votingActive && (
          <TouchableOpacity style={styles.proofButton} onPress={handleSubmitProof}>
            <Text style={styles.proofText}>Submit Proof</Text>
          </TouchableOpacity>
        )}
        {item.status === 'completed' && item.votingActive && (
          <TouchableOpacity style={styles.voteButton} onPress={handleOpenVoting}>
            <Text style={styles.voteText}>Vote Now</Text>
          </TouchableOpacity>
        )}
        {item.votingAlert && <Text style={styles.alertText}>New Vote Alert!</Text>}
        <TouchableOpacity style={styles.chatButton} onPress={handleOpenChat}>
          <Text style={styles.chatText}>Chat</Text>
        </TouchableOpacity>

        {item.status === 'active' && <Text style={styles.statusText}>Accept by 12:26 PM</Text>}
        {item.status === 'pending' && <Text style={styles.statusText}>Waiting for Opponent</Text>}
        {item.status === 'completed' && (
          <Text style={item.result === 'won' ? styles.wonText : styles.lostText}>
            {item.result === 'won' ? 'You Won' : 'You Lost'}
          </Text>
        )}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        {unreadNotifications > 0 && (
          <Text style={styles.notificationBadge}>{unreadNotifications}</Text>
        )}
        {/* Avatar, logo, stones as before */}
      </Animated.View>
      <FlatList
        data={challenges}
        renderItem={renderChallenge}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
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
  container: { flex: 1, backgroundColor: '#1A1A1A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center' },
  list: { padding: 20 },
  card: {
    backgroundColor: '#2A2A2A',
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    shadowOpacity: 0.2,
    flexDirection: 'column',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bestFriendBadge: { color: '#FFD700', fontSize: 14, fontWeight: 'bold' },
  cardTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', flex: 1 },
  opponentRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  opponentText: { color: '#888' },
  stakesText: { color: 'white' },
  daresSection: { marginTop: 15 },
  sectionTitle: { color: '#FFD700', fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  dareItem: { color: '#CCC', fontSize: 14, marginBottom: 2 },
  achievementsSection: { marginTop: 10 },
  achievementsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  achievementBadge: {
    backgroundColor: '#3A3A3A',
    color: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    marginRight: 5,
    marginBottom: 5,
  },
  punishmentSection: { marginTop: 10 },
  punishmentText: { color: '#FFA500', fontSize: 14, fontStyle: 'italic' },
  statusText: { color: '#FF0000', marginTop: 5 },
  wonText: { color: '#00FF00', marginTop: 5 },
  lostText: { color: '#FF0000', marginTop: 5 },
  proofButton: { backgroundColor: '#00FF00', padding: 10, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  voteButton: { backgroundColor: '#3A3A3A', padding: 10, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  proofText: { color: 'white', fontWeight: 'bold' },
  voteText: { color: 'white' },
  notificationBadge: {
    backgroundColor: '#FF0000',
    color: 'white',
    borderRadius: 10,
    width: 20,
    height: 20,
    textAlign: 'center',
    position: 'absolute',
    top: 5,
    right: 5
  },
  alertText: { color: '#00FF00', marginTop: 5, fontWeight: 'bold' },
  chatButton: { backgroundColor: '#3A3A3A', padding: 10, borderRadius: 10, alignItems: 'center', marginTop: 5 },
  chatText: { color: 'white' },
});

export default ChallengesScreen;
