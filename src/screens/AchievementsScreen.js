import { useContext } from 'react';
import { Animated, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { useFadeIn, useStaggeredList } from '../hooks/useAnimations';

const AchievementsScreen = () => {
  const { user } = useContext(AuthContext);
  const fadeAnim = useFadeIn(600);

  // Available badges with unlock conditions
  const allBadges = [
    { id: '1_dares', title: 'First Dare', description: 'Complete your first dare' },
    { id: '5_dares', title: 'Getting Started', description: 'Complete 5 dares' },
    { id: '10_dares', title: 'Daredevil', description: 'Complete 10 dares' },
    { id: '25_dares', title: 'Risk Taker', description: 'Complete 25 dares' },
    { id: '50_dares', title: 'Legend', description: 'Complete 50 dares' },
    { id: '100_dares', title: 'Myth', description: 'Complete 100 dares' },
  ];

  const achievements = [
    { title: 'Win a Challenge', progress: '0/1', reward: '5 Free Stones' },
    { title: 'Lose a Challenge', progress: '0/1', reward: '5 Free Stones' },
    { title: 'Refer 3 Friends', progress: '0/3', reward: '20 Free Stones', hasLink: true },
    { title: 'Activate 5 Dare Challenges', progress: '0/5' },
  ];

  const anims = useStaggeredList(achievements.length);
  const badgeAnims = useStaggeredList(allBadges.length);

  const renderAchievement = ({ item, index }) => (
    <Animated.View style={[
      styles.card,
      { opacity: anims[index].fade, transform: [{ translateY: anims[index].slide }] },
    ]}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardProgress}>{item.progress}</Text>
      {item.reward && (
        <TouchableOpacity style={styles.rewardButton}>
          <Text style={styles.rewardText}>{item.reward}</Text>
        </TouchableOpacity>
      )}
      {item.hasLink && (
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>Copy Referral Link</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  const renderBadge = ({ item, index }) => {
    const isUnlocked = user?.badges?.includes(item.id);
    return (
      <Animated.View style={[
        styles.badgeCard,
        { opacity: badgeAnims[index].fade, transform: [{ translateY: badgeAnims[index].slide }] },
        !isUnlocked && styles.lockedBadge,
      ]}>
        <Text style={styles.badgeTitle}>{item.title}</Text>
        <Text style={styles.badgeDescription}>{item.description}</Text>
        <Text style={styles.badgeEmoji}>{isUnlocked ? '🏆' : '🔒'}</Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.stats}>
          <Text style={styles.statText}>Level {user?.level || 1}</Text>
          <Text style={styles.statText}>{user?.xp || 0} XP</Text>
          <Text style={styles.statText}>{user?.currentStreak || 0} Day Streak</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
        <Text style={styles.sectionTitle}>Badges</Text>
        <FlatList
          data={allBadges}
          renderItem={renderBadge}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          numColumns={2}
          columnWrapperStyle={styles.badgeRow}
        />
      </Animated.View>

      <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <FlatList
          data={achievements}
          renderItem={renderAchievement}
          keyExtractor={(item) => item.title}
          contentContainerStyle={styles.list}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center' },
  stats: { flexDirection: 'row', justifyContent: 'space-around', flex: 1 },
  statText: { color: 'white', fontSize: 14, textAlign: 'center' },
  section: { marginBottom: 20 },
  sectionTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 20, marginBottom: 10 },
  list: { padding: 20 },
  badgeRow: { justifyContent: 'space-between' },
  badgeCard: { backgroundColor: '#2A2A2A', padding: 20, borderRadius: 15, margin: 5, flex: 1, alignItems: 'center' },
  lockedBadge: { backgroundColor: '#1A1A1A', opacity: 0.5 },
  badgeTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  badgeDescription: { color: '#888', fontSize: 12, textAlign: 'center', marginTop: 5 },
  badgeEmoji: { fontSize: 24, marginTop: 10 },
  card: { backgroundColor: '#2A2A2A', padding: 15, borderRadius: 20, marginBottom: 15, shadowOpacity: 0.2 },
  cardTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  cardProgress: { color: '#888', fontSize: 14 },
  rewardButton: { backgroundColor: '#00FF00', padding: 10, borderRadius: 20, marginTop: 10 },
  rewardText: { color: 'white', textAlign: 'center' },
  linkButton: { backgroundColor: '#3A3A3A', padding: 10, borderRadius: 20, marginTop: 10 },
  linkText: { color: 'white', textAlign: 'center' },
});

export default AchievementsScreen;
