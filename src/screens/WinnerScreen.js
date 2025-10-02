import * as Sharing from "expo-sharing";
import { useRef } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { captureRef } from "react-native-view-shot";

export default function WinnerScreen({ route }) {
  const { dare, winner } = route.params;
  const cardRef = useRef();

  async function handleShare() {
    try {
      const uri = await captureRef(cardRef, {
        format: "png",
        quality: 0.9
      });
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Share Winner Card"
      });
    } catch (e) {
      console.error("Error sharing:", e);
    }
  }

  return (
    <View style={styles.container}>
      {/* Winner card wrapped in ref */}
      <View ref={cardRef} collapsable={false} style={styles.card}>
        <Text style={styles.header}>🏆 Winner Announcement</Text>
        <Text style={styles.title}>{dare?.title}</Text>
        <Image
          source={{ uri: winner?.photoURL || "https://via.placeholder.com/100" }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{winner?.displayName || "Anonymous"}</Text>
        <Text style={styles.reward}>+{dare?.rewardStone} Stone 🪨</Text>
      </View>

      {/* Share button */}
      <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
        <Text style={styles.shareText}>📤 Share</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20, alignItems: "center" },
  card: { alignItems: "center", padding: 20, backgroundColor: "#f9f9f9", borderRadius: 12, width: "90%" },
  header: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  title: { fontSize: 16, marginBottom: 12, textAlign: "center" },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  name: { fontSize: 18, fontWeight: "600" },
  reward: { fontSize: 16, marginTop: 6, color: "#2a9d8f" },
  shareBtn: { marginTop: 20, padding: 12, backgroundColor: "#111", borderRadius: 10 },
  shareText: { color: "#fff", fontWeight: "600" },
});
