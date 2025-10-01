import { useContext } from "react";
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AuthContext } from '../context/AuthContext';

export default function WalletScreen() {
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
        <Text style={styles.feedHeader}>Wallet</Text>
        <View style={styles.balance}>
          <Text style={styles.balanceText}>Stone Balance</Text>
          <Text style={styles.amount}>120 🪨</Text>
        </View>

        <View style={styles.txCard}><Text>+20 — Completed Dare — Today</Text></View>
        <View style={styles.txCard}><Text>+10 — Daily Streak — Yesterday</Text></View>
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
  txCard: { backgroundColor: "#f4f4f4", borderRadius: 12, padding: 12, marginBottom: 10 },
});
