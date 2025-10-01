import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.avatar} />
      <Text style={styles.name}>@you</Text>
      <Text style={styles.meta}>Stone: 120 🪨  •  Wins: 5  •  Streak: 3</Text>

      <View style={styles.block}><Text>My Dares (placeholder)</Text></View>
      <View style={styles.block}><Text>Activity (placeholder)</Text></View>
      <View style={styles.block}><Text>Settings (placeholder)</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16, alignItems: "center" },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: "#eee", marginTop: 8, marginBottom: 10 },
  name: { fontSize: 20, fontWeight: "700" },
  meta: { color: "#666", marginTop: 4, marginBottom: 16 },
  block: { alignSelf: "stretch", backgroundColor: "#f4f4f4", borderRadius: 12, padding: 12, marginBottom: 12 },
});
