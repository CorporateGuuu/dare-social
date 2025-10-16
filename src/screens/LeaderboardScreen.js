import { useContext } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from '../../components/themed-view';
import { useThemeColor } from '../../hooks/use-theme-color';
import { AuthContext } from '../context/AuthContext';
import { useRealtimeLeaderboard } from '../hooks/useRealtimeLeaderboard';

export default function LeaderboardScreen() {
  const { user, logout } = useContext(AuthContext);
  const { users, loading } = useRealtimeLeaderboard();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: cardColor, borderBottomColor: borderColor }]}>
        {user?.avatar ? <Image source={{ uri: user.avatar }} style={styles.avatar} /> : <View style={styles.avatar} />}
        <Text style={[styles.logo, { color: textColor }]}>▲</Text>
        <View style={styles.stones}>
          <Text style={[styles.stonesText, { color: textColor }]}>∘ {user?.stones || 0}</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={[styles.logout, { color: textColor }]}>Logout</Text>
        </TouchableOpacity>
      </View>
      {/* Rest of the screen */}
      <View style={[styles.content, { backgroundColor }]}>
        <Text style={[styles.feedHeader, { color: textColor }]}>Leaderboard</Text>
        {loading ? (
          <Text style={[styles.loading, { color: textColor }]}>Loading leaderboard...</Text>
        ) : users.length > 0 ? (
          <>
            <View style={styles.topRow}>
              <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
                {users[1] ? <Text style={[styles.name, { color: textColor }]}>{users[1].displayName}</Text> : <Text style={{ color: textColor }}>?</Text>}
              </View>
              <View style={[styles.card, styles.centerCard, { backgroundColor: cardColor, borderColor }]}>
                {users[0] ? <Text style={[styles.name, { color: textColor }]}>{users[0].displayName}</Text> : <Text style={{ color: textColor }}>?</Text>}
              </View>
              <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
                {users[2] ? <Text style={[styles.name, { color: textColor }]}>{users[2].displayName}</Text> : <Text style={{ color: textColor }}>?</Text>}
              </View>
            </View>
            <View style={[styles.listCard, { backgroundColor: cardColor, borderColor }]}>
              {users.slice(3).map((user) => (
                <Text key={user.uid} style={{ color: textColor }}>{user.displayName} — {user.stoneBalance} Stone</Text>
              ))}
            </View>
            <Text style={[styles.encouragement, { color: textColor }]}>
              Keep climbing! Complete dares to earn stones.
            </Text>
          </>
        ) : (
          <Text style={[styles.loading, { color: textColor }]}>No users found yet</Text>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  logo: { flex: 1, textAlign: 'center', fontSize: 24 },
  stones: {},
  stonesText: { fontSize: 16 },
  logout: { marginLeft: 10 },
  content: { flex: 1, padding: 16 },
  feedHeader: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  loading: { textAlign: 'center', fontSize: 16, marginTop: 20 },
  topRow: { flexDirection: "row", justifyContent: "space-between" },
  card: { flex: 1, height: 88, margin: 4, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  centerCard: { transform: [{ translateY: -8 }] },
  name: { fontSize: 14, marginTop: 4, textAlign: 'center' },
  listCard: { marginTop: 16, padding: 12, borderRadius: 12, borderWidth: 1 },
  encouragement: { marginTop: 12, fontWeight: "600", textAlign: 'center' },
});
