import React from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const achievements = [
  {
    id: 'win-challenge',
    title: 'Win a Challenge',
    progress: '0/1',
    reward: '5 Free Stones',
    buttonColor: '#00FF00',
  },
  {
    id: 'lose-challenge',
    title: 'Lose a Challenge',
    progress: '0/1',
    reward: '5 Free Stones',
    buttonColor: '#00FF00',
  },
  {
    id: 'refer-friends',
    title: 'Refer 3 Friends',
    progress: '0/3',
    reward: '20 Free Stones',
    buttonColor: '#00FF00',
    secondaryButton: 'Copy Referral Link',
    secondaryButtonColor: '#666',
  },
  {
    id: 'activate-dares',
    title: 'Activate 5 Dare Challenges',
    progress: '0/5',
    reward: null,
  },
];

export default function AchievementsScreen() {
  const renderAchievement = ({ item }: { item: any }) => (
    <View style={styles.achievementCard}>
      <Text style={styles.achievementTitle}>{item.title}</Text>
      <Text style={styles.achievementProgress}>{item.progress}</Text>
      {item.reward && (
        <TouchableOpacity style={[styles.rewardButton, { backgroundColor: item.buttonColor }]}>
          <Text style={styles.rewardButtonText}>{item.reward}</Text>
        </TouchableOpacity>
      )}
      {item.secondaryButton && (
        <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: item.secondaryButtonColor }]}>
          <Text style={styles.secondaryButtonText}>{item.secondaryButton}</Text>
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

      <View style={styles.content}>
        <Text style={styles.title}>
          Achievements
        </Text>
        <Text style={styles.subtitle}>
          0 complete
        </Text>
        <FlatList
          data={achievements}
          keyExtractor={(item) => item.id}
          renderItem={renderAchievement}
          contentContainerStyle={styles.listContainer}
        />
      </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  achievementCard: {
    marginHorizontal: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  achievementProgress: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  rewardButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  rewardButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  secondaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
