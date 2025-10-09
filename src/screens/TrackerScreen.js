import { useContext } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';

export default function TrackerScreen() {
  const { user } = useContext(AuthContext);

  // Mock data for demonstration - in real app, fetch from backend/context
  const stats = {
    level: user?.level || 1,
    xp: user?.xp || 120,
    xpToNext: 200, // XP needed for next level
    currentStreak: user?.currentStreak || 3,
    stones: user?.stones || 45,
    completedDares: 7,
    activeDares: 2,
  };

  const recentActivity = [
    { id: 1, type: 'completed', dare: 'Do 20 push-ups', time: '2h ago' },
    { id: 2, type: 'accepted', dare: 'Ice bucket challenge', time: '1d ago' },
    { id: 3, type: 'won', dare: 'Sing in public', time: '2d ago' },
  ];

  const xpProgress = stats.xp / stats.xpToNext;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {user?.avatar ? <Image source={{ uri: user.avatar }} style={styles.avatar} /> : <View style={styles.avatar} />}
        <Text style={styles.logo}>▲</Text>
        <View style={styles.stones}>
          <Text style={styles.stonesText}>∘ {stats.stones}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Your Progress</Text>

        <View style={styles.statCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Level</Text>
            <Text style={styles.statValue}>{stats.level}</Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${xpProgress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{stats.xp} / {stats.xpToNext} XP</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.smallStat}>
            <Text style={styles.smallStatValue}>{stats.currentStreak}</Text>
            <Text style={styles.smallStatLabel}>Day Streak</Text>
          </View>
          <View style={styles.smallStat}>
            <Text style={styles.smallStatValue}>{stats.completedDares}</Text>
            <Text style={styles.smallStatLabel}>Completed Dares</Text>
          </View>
          <View style={styles.smallStat}>
            <Text style={styles.smallStatValue}>{stats.activeDares}</Text>
            <Text style={styles.smallStatLabel}>Active Dares</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentActivity.map((activity) => (
          <View key={activity.id} style={styles.activityCard}>
            <Text style={styles.activityType}>
              {activity.type === 'completed' && '✅ Completed'}
              {activity.type === 'accepted' && '📥 Accepted'}
              {activity.type === 'won' && '🏆 Won'}
            </Text>
            <Text style={styles.activityDare}>{activity.dare}</Text>
            <Text style={styles.activityTime}>{activity.time}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  logo: { flex: 1, textAlign: 'center', fontSize: 24 },
  stones: {},
  stonesText: { fontSize: 16 },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  statCard: { backgroundColor: "#f9f9f9", padding: 16, borderRadius: 12, marginBottom: 20 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statLabel: { fontSize: 16, color: '#666' },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  progressContainer: {},
  progressBar: { height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', backgroundColor: '#FF6B35' },
  progressText: { fontSize: 12, color: '#666', textAlign: 'center' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  smallStat: { flex: 1, alignItems: 'center', paddingVertical: 16, backgroundColor: '#f9f9f9', borderRadius: 12, marginHorizontal: 4 },
  smallStatValue: { fontSize: 24, fontWeight: 'bold' },
  smallStatLabel: { fontSize: 12, color: '#666', textAlign: 'center' },
  activityCard: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 12, marginBottom: 8 },
  activityType: { fontSize: 14, fontWeight: 'bold' },
  activityDare: { fontSize: 16, marginVertical: 4 },
  activityTime: { fontSize: 12, color: '#666' },
});
