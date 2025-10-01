import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { acceptDareService } from "../lib/services";

export default function DareDetailsScreen({ navigation, route }) {
  const { dareId } = route.params || {};
  const [loading, setLoading] = useState(false);

  async function onAccept() {
    try {
      setLoading(true);
      await acceptDareService({ dareId });
      Alert.alert("Joined", "You joined this dare.");
      navigation.navigate("CompleteDare", { dareId });
    } catch (e) {
      Alert.alert("Error", e?.message ?? "Failed to join");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.media} />
      <Text style={styles.title}>Dare #{dareId}</Text>
      <Text style={styles.desc}>Reward: +20 Stone 🪨</Text>

      <TouchableOpacity style={styles.btnPrimary} onPress={onAccept} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Accept Dare</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.goBack()}>
        <Text style={styles.btnSecondaryText}>Decline</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  media: { height: 220, backgroundColor: "#eee", borderRadius: 12, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "700" },
  desc: { fontSize: 14, color: "#555", marginTop: 8, marginBottom: 16 },
  btnPrimary: { backgroundColor: "#111", paddingVertical: 14, borderRadius: 10, marginTop: 8 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  btnSecondary: { paddingVertical: 12, borderRadius: 10, marginTop: 8, borderWidth: 1, borderColor: "#ccc" },
  btnSecondaryText: { textAlign: "center", color: "#333", fontWeight: "600" },
});
