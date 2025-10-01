import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { acceptDare } from "../lib/firebase";

export default function DareDetailsScreen({ navigation, route }) {
  const { dare } = route.params;
  const [loading, setLoading] = useState(false);

  async function handleAccept() {
    try {
      setLoading(true);
      await acceptDare({ dareId: dare.id });
      Alert.alert("Success", "You accepted the dare!");
      navigation.navigate("CompleteDare", { dare });
    } catch (e) {
      Alert.alert("Error", e.message ?? "Failed to accept dare");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.media} />
      <Text style={styles.title}>{dare.title}</Text>
      <Text style={styles.desc}>{dare.description}</Text>
      <Text style={styles.reward}>Reward: +{dare.rewardStone} Stone 🪨</Text>

      <TouchableOpacity style={styles.btnPrimary} onPress={handleAccept} disabled={loading}>
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
  desc: { fontSize: 14, marginTop: 6, marginBottom: 10 },
  reward: { fontSize: 14, color: "#333", marginBottom: 16 },
  btnPrimary: { backgroundColor: "#111", paddingVertical: 14, borderRadius: 10, marginTop: 8 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  btnSecondary: { paddingVertical: 12, borderRadius: 10, marginTop: 8, borderWidth: 1, borderColor: "#ccc" },
  btnSecondaryText: { textAlign: "center", color: "#333", fontWeight: "600" },
});
