import { useContext } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from '../context/AuthContext';
import { useRealtimeLeaderboard } from '../hooks/useRealtimeLeaderboard';

export default function LeaderboardScreen() {
  const { user, logout } = useContext(AuthContext);
  const { users, loading } = useRealtimeLeaderboard();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {user?.avatar ? <Image source={{ uri: user.avatar }} style={styles.avatar} /> : <View style={styles.avatar} />}
        <Text style={styles.logo}>▲</Text>
        <View style={styles.stones}>
          <Text style={styles.stonesText}>∘ {user?.stones || 0}</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>
      {/* Rest of the screen */}
      <View style={styles.content}>
        <Text style={styles.feedHeader}>Leaderboard</Text>
        {loading ? (
          <Text style={styles.loading}>Loading leaderboard...</Text>
        ) : users.length > 0 ? (
          <>
            <View style={styles.topRow}>
              <View style={styles.card}>
                {users[1] ? <Text style={styles.name}>{users[1].displayName}</Text> : <Text>?</Text>}
              </View>
              <View style={[styles.card, styles.centerCard]}>
                {users[0] ? <Text style={styles.name}>{users[0].displayName}</Text> : <Text>?</Text>}
              </View>
              <View style={styles.card}>
                {users[2] ? <Text style={styles.name}>{users[2].displayName}</Text> : <Text>?</Text>}
              </View>
            </View>
            <View style={styles.listCard}>
              {users.slice(3).map((user) => (
                <Text key={user.uid}>{user.displayName} — {user.stoneBalance} Stone</Text>
              ))}
            </View>
            <Text style={styles.encouragement}>
              Keep climbing! Complete dares to earn stones.
            </Text>
          </>
        ) : (
          <Text style={styles.loading}>No users found yet</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  logo: { flex: 1, textAlign: 'center', fontSize: 24 },
  stones: {},
  stonesText: { fontSize: 16 },
  logout: { color: 'white', marginLeft: 10 },
  content: { flex: 1, backgroundColor: "#fff", padding: 16 },
  feedHeader: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  loading: { textAlign: 'center', fontSize: 16, marginTop: 20 },
  topRow: { flexDirection: "row", justifyContent: "space-between" },
  card: { flex: 1, height: 88, backgroundColor: "#eee", margin: 4, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  centerCard: { transform: [{ translateY: -8 }] },
  name: { fontSize: 14, marginTop: 4, textAlign: 'center' },
  listCard: { marginTop: 16, backgroundColor: "#f4f4f4", padding: 12, borderRadius: 12 },
  encouragement: { color: "#666", marginTop: 12, fontWeight: "600", textAlign: 'center' },
});
