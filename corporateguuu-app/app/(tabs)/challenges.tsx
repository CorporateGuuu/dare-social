import React from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const challenges = [
  {
    id: '1',
    title: 'The Kings will be better than the Bulls this season',
    challenger: '@willsamrick',
    challengerAvatar: '😎',
    opponent: '@frankvecchie',
    opponentAvatar: '🤓',
    stake: 25,
    status: 'active',
    deadline: 'Accept by 12:26 PM',
    centerIcon: '⚔️', // crossed swords
  },
  {
    id: '2',
    title: 'The Kings will be better than the Bulls this season',
    challenger: '@willsamrick',
    challengerAvatar: '😎',
    opponent: '@mattbraun',
    opponentAvatar: '🥸',
    stake: 25,
    status: 'completed',
    result: 'You Won',
    buttonText: 'Post',
    buttonColor: '#007bff',
  },
  {
    id: '3',
    title: 'Bitcoin will not reach $110,000',
    challenger: '@willsamrick',
    challengerAvatar: '😎',
    opponent: '@brendengroess',
    opponentAvatar: '🤑',
    stake: 25,
    status: 'completed',
    result: 'You Lost',
    buttonText: 'Add Proof',
    buttonColor: '#007bff',
  },
  {
    id: '4',
    title: 'Opponent Must Accept by 2:38 PM',
    challenger: '@willsamrick',
    challengerAvatar: '😎',
    opponent: '@frankvecchie',
    opponentAvatar: '🤓',
    stake: 25,
    status: 'active',
    deadline: 'Accept by 2:38 PM',
    centerIcon: '…', // ellipsis
  },
  {
    id: '5',
    title: 'I will run a marathon',
    leftIcon: '▶️',
    rightIcon: '∘ 25',
    status: 'waiting',
    subtitle: 'Waiting for Opponent to Accept by 1:34 PM',
  },
];

export default function ChallengesScreen() {
  const renderChallenge = ({ item }: { item: any }) => (
    <View
      style={[
        styles.challengeCard,
        item.status === 'active' && styles.activeCard,
        item.status === 'completed' && styles.completedCard,
      ]}
    >
      {item.leftIcon && item.rightIcon ? (
        // Special format for single player challenge
        <View style={styles.singlePlayerRow}>
          <Text style={styles.icon}>{item.leftIcon}</Text>
          <View style={styles.singlePlayerContent}>
            <Text style={styles.challengeTitle}>{item.title}</Text>
          </View>
          <Text style={styles.stakes}>{item.rightIcon}</Text>
        </View>
      ) : (
        // Standard two-player format
        <View style={styles.twoPlayerRow}>
          <View style={styles.player}>
            <Text style={styles.avatar}>{item.challengerAvatar}</Text>
            <Text style={styles.playerName}>{item.challenger}</Text>
          </View>
          <View style={styles.center}>
            <Text style={styles.centerIcon}>{item.centerIcon}</Text>
          </View>
          <View style={styles.player}>
            <Text style={styles.avatar}>{item.opponentAvatar}</Text>
            <Text style={styles.playerName}>{item.opponent}</Text>
          </View>
        </View>
      )}
      {/* Stakes row */}
      {(!item.leftIcon || !item.rightIcon) && (
        <View style={styles.stakesRow}>
          <Text style={styles.stakes}>∘ {item.stake}</Text>
          <Text style={styles.stakes}>∘ {item.stake}</Text>
        </View>
      )}
      {/* Status text */}
      {item.result ? (
        <Text style={[styles.statusText, item.result === 'You Won' ? styles.winText : styles.loseText]}>
          {item.result}
        </Text>
      ) : item.subtitle ? (
        <Text style={[styles.statusText, styles.redText]}>
          {item.subtitle}
        </Text>
      ) : item.deadline ? (
        <Text style={[styles.statusText, styles.redText]}>
          {item.deadline}
        </Text>
      ) : null}
      {/* Button */}
      {item.buttonText && (
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: item.buttonColor }]}>
          <Text style={styles.actionButtonText}>{item.buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.balanceContainer}>
          <View style={styles.stonesBadge}>
            <Text style={styles.stonesText}>∘ 10</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        renderItem={renderChallenge}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  stonesBadge: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  stonesText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  challengeCard: {
    marginHorizontal: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  activeCard: {
    borderWidth: 2,
    borderColor: 'red',
  },
  completedCard: {
    backgroundColor: '#333',
  },
  twoPlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  player: {
    flex: 1,
    alignItems: 'center',
  },
  center: {
    paddingHorizontal: 16,
  },
  centerIcon: {
    fontSize: 20,
  },
  avatar: {
    fontSize: 32,
    marginBottom: 4,
  },
  playerName: {
    fontSize: 12,
    color: '#ccc',
  },
  stakesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    marginBottom: 8,
  },
  stakes: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  statusText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  redText: {
    color: 'red',
  },
  winText: {
    color: '#00FF00',
  },
  loseText: {
    color: 'red',
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 25,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  singlePlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  singlePlayerContent: {
    flex: 1,
    paddingHorizontal: 8,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  icon: {
    fontSize: 24,
  },
});
