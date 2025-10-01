import { useContext } from "react";
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AuthContext } from '../context/AuthContext';

export default function LeaderboardScreen() {
  const { user, logout } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.logo}>▲</Text>
        <View style={styles.stones}>
          <Text style={styles.stonesText}>∘ {user.stones}</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>
      {/* Rest of the screen */}
      <View style={styles.content}>
        <Text style={styles.feedHeader}>Leaderboard</Text>
        <View style={styles.topRow}>
          <View style={styles.card}><Text style={styles.rank}>🥈</Text></View>
          <View style={[styles.card, styles.centerCard]}><Text style={styles.rank}>🥇</Text></View>
          <View style={styles.card}><Text style={styles.rank}>🥉</Text></View>
        </View>
        <View style={styles.listCard}>
          <Text>4) @sam — 240 Stone</Text>
          <Text>5) @lee — 220 Stone</Text>
          <Text>...</Text>
        </View>
        <Text style={styles.lastPlace}>Last Place: @alex — 5 Stone (Do a dare!)</Text>
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
  topRow: { flexDirection: "row", justifyContent: "space-between" },
  card: { flex: 1, height: 88, backgroundColor: "#eee", margin: 4, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  centerCard: { transform: [{ translateY: -8 }] },
  rank: { fontSize: 28 },
  listCard: { marginTop: 16, backgroundColor: "#f4f4f4", padding: 12, borderRadius: 12 },
  lastPlace: { color: "#d00", marginTop: 12, fontWeight: "600" },
});
