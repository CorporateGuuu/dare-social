import { useContext } from "react";
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AuthContext } from '../context/AuthContext';

export default function WalletScreen() {
  const { user, logout } = useContext(AuthContext);

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
        <Text style={styles.feedHeader}>Wallet</Text>
        <View style={styles.balance}>
          <Text style={styles.balanceText}>Stone Balance</Text>
          <Text style={styles.amount}>{user?.stones || 0} 🪨</Text>
          <Text style={styles.levelText}>Level {user?.level || 1} • {user?.xp || 0} XP</Text>
        </View>

        <View style={styles.streakInfo}>
          <Text style={styles.streakText}>{user?.currentStreak || 0} Day Streak</Text>
        </View>

        {/* Placeholder transactions - in real app, fetch from user.transactions */}
        <View style={styles.txCard}><Text>+20 — Completed Dare — Today</Text></View>
        {(user?.currentStreak || 0) > 0 && (
          <View style={styles.txCard}><Text>+5 — Daily Streak ({user?.currentStreak || 0} days)</Text></View>
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
  balance: { backgroundColor: "#111", borderRadius: 12, padding: 16, marginBottom: 16 },
  balanceText: { color: "#aaa" },
  amount: { color: "#fff", fontSize: 28, fontWeight: "800" },
  levelText: { color: "#aaa", fontSize: 14, marginTop: 8 },
  streakInfo: { alignItems: 'center', marginBottom: 16 },
  streakText: { fontSize: 16, fontWeight: '500', color: '#333' },
  txCard: { backgroundColor: "#f4f4f4", borderRadius: 12, padding: 12, marginBottom: 10 },
});
