import React, { useContext, useState } from 'react';
import { Animated, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useFadeIn, useSlideUp, useSwipeGesture } from '../hooks/useAnimations';

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
  const fadeAnim = useFadeIn(500);
  const slideAnim = useSlideUp(50, 500);

  const [challenges, setChallenges] = useState([
    { id: '1', title: 'The Kings will be better than the Bulls', opponent: '@frankvecchie', stakes: '25', status: 'active' },
    { id: '2', title: 'I will run a marathon', opponent: 'Waiting', stakes: '25', status: 'pending' },
    { id: '3', title: 'The Kings won', opponent: '@mattbraun', stakes: '25', status: 'completed', result: 'won' },
  ]);

  const renderChallenge = ({ item }) => (
    <ChallengeCard
      item={item}
      onReject={() => {
        console.log(`Rejected challenge: ${item.title}`);
        setChallenges(challenges.filter(c => c.id !== item.id)); // Mock remove
      }}
      onAccept={() => {
        console.log(`Accepted challenge: ${item.title}`);
        setChallenges(challenges.map(c => c.id === item.id ? { ...c, status: 'accepted' } : c)); // Mock accept
      }}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        {/* Avatar, logo, stones as before */}
      </Animated.View>
      <FlatList
        data={challenges}
        renderItem={renderChallenge}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
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
});

export default ChallengesScreen;
