import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import React, { useContext, useEffect, useState } from 'react';
import { Animated, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { submitProof, tallyVotes } from '../../corporateguuu-app/src/utils/votingUtils';
import VotingModal from '../components/VotingModal';
import { AuthContext } from '../context/AuthContext';
import { useFadeIn, useSlideUp, useSwipeGesture } from '../hooks/useAnimations';

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
  const slideAnim = useSlideUp(50, 500);

  const [challenges, setChallenges] = useState([
    { id: '1', title: 'The Kings will be better than the Bulls', opponent: '@frankvecchie', stakes: '25', status: 'active' },
    { id: '2', title: 'I will run a marathon', opponent: 'Waiting', stakes: '25', status: 'pending' },
    { id: '3', title: 'The Kings won', opponent: '@mattbraun', stakes: '25', status: 'completed', result: 'won' },
  ]);

  const [votingModalVisible, setVotingModalVisible] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [proofs, setProofs] = useState([]); // Mock proofs for selected challenge
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    // Handle notification updates for UI
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      setUnreadNotifications(prev => prev + 1);

      // Highlight challenges with voting alerts
      if (notification.request.content.categoryIdentifier === 'VOTING_ALERT') {
        setChallenges(prevChallenges =>
          prevChallenges.map(c =>
            c.id === notification.request.content.data.challengeId
              ? { ...c, votingAlert: true }
              : c
          )
        );
      }
    });
    return () => subscription.remove();
  }, []);

  const renderChallenge = ({ item }) => {
    // const { pan, panHandlers } = useSwipeGesture(/* callbacks */);

    const handleSubmitProof = async () => {
      const { status } = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
      if (status !== 'done') return;
      const proofData = { text: 'Mock proof text', image: 'mock-uri' };
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
      tallyVotes(item.id); // Start auto-tally timer
    };

    const handleOpenChat = () => {
      navigation.navigate('Chat', { challengeId: item.id });
    };

    return (
      <Animated.View style={[styles.card]}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={styles.opponentRow}>
          <Text style={styles.opponentText}>vs {item.opponent}</Text>
          <Text style={styles.stakesText}>∘ {item.stakes}</Text>
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
        {/* Existing status texts */}
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
  cardTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  opponentRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  opponentText: { color: '#888' },
  stakesText: { color: 'white' },
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
