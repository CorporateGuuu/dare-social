import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function WalletScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Wallet</Text>
      <View style={styles.balance}>
        <Text style={styles.balanceText}>Stone Balance</Text>
        <Text style={styles.amount}>120 🪨</Text>
      </View>

      <View style={styles.txCard}><Text>+20 — Completed Dare — Today</Text></View>
      <View style={styles.txCard}><Text>+10 — Daily Streak — Yesterday</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  balance: { backgroundColor: "#111", borderRadius: 12, padding: 16, marginBottom: 16 },
  balanceText: { color: "#aaa" },
  amount: { color: "#fff", fontSize: 28, fontWeight: "800" },
  txCard: { backgroundColor: "#f4f4f4", borderRadius: 12, padding: 12, marginBottom: 10 },
});
