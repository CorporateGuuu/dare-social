import React from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from 'react-native';

interface Achievement {
  id: string;
  title: string;
  progress: string;
  prize: string;
}

const achievementsData: Achievement[] = [
  {
    id: 'refer-friends',
    title: 'Refer 3 Friends',
    progress: '0/3',
    prize: '20 Stones',
  },
  {
    id: 'lose-challenge',
    title: 'Lose a Challenge',
    progress: '0/1',
    prize: 'Frame',
  },
  {
    id: 'wager-stones',
    title: 'Wager 200 Stones',
    progress: '0/200',
    prize: '100 Stones',
  },
];

export default function AchievementsScreen() {
  const renderAchievement = ({ item }: { item: Achievement }) => (
    <View style={styles.achievementCard}>
      <Text style={styles.achievementTitle}>{item.title}</Text>
      <Text style={styles.achievementProgress}>{item.progress}</Text>
      <Text style={styles.prizeText}>{item.prize}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>
            Achievements
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <FlatList
          data={achievementsData}
          keyExtractor={(item) => item.id}
          renderItem={renderAchievement}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
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
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: '#1A1A1A',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  achievementCard: {
    width: 150,
    marginHorizontal: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
  prizeText: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
});
