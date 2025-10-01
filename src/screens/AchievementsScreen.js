import { useContext } from 'react';
import { Animated, FlatList, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useFadeIn, useSlideUp, useStaggeredList } from '../hooks/useAnimations';

const AchievementsScreen = () => {
  const { user } = useContext(AuthContext);
  const fadeAnim = useFadeIn(600);
  const slideAnim = useSlideUp(50, 600);

  const achievements = [
    { title: 'Win a Challenge', progress: '0/1', reward: '5 Free Stones' },
    { title: 'Lose a Challenge', progress: '0/1', reward: '5 Free Stones' },
    { title: 'Refer 3 Friends', progress: '0/3', reward: '20 Free Stones', hasLink: true },
    { title: 'Activate 5 Dare Challenges', progress: '0/5' },
  ];

  const anims = useStaggeredList(achievements.length);

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

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        {/* Avatar, logo, stones as before */}
      </Animated.View>
      <FlatList
        data={achievements}
        renderItem={renderAchievement}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center' },
  list: { padding: 20 },
  card: { backgroundColor: '#2A2A2A', padding: 15, borderRadius: 20, marginBottom: 15, shadowOpacity: 0.2 },
  cardTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  cardProgress: { color: '#888', fontSize: 14 },
  rewardButton: { backgroundColor: '#00FF00', padding: 10, borderRadius: 20, marginTop: 10 },
  rewardText: { color: 'white', textAlign: 'center' },
  linkButton: { backgroundColor: '#3A3A3A', padding: 10, borderRadius: 20, marginTop: 10 },
  linkText: { color: 'white', textAlign: 'center' },
});

export default AchievementsScreen;
