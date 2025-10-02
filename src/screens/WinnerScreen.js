import * as Sharing from "expo-sharing";
import { useRef } from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { captureRef } from "react-native-view-shot";

const { width, height } = Dimensions.get("window");

export default function WinnerScreen({ route }) {
  const { dare, winner } = route.params;
  const storyRef = useRef();

  async function handleShare() {
    try {
      const uri = await captureRef(storyRef, {
        format: "png",
        quality: 0.95,
        result: "tmpfile",
        width: 1080,
        height: 1920
      });
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Share Winner Story"
      });
    } catch (e) {
      console.error("Error sharing:", e);
    }
  }

  return (
    <View style={styles.container}>
      <View ref={storyRef} collapsable={false} style={styles.storyCard}>

        {/* App Logo Overlay */}
        <Image
          source={{ uri: "https://yourcdn.com/logo.png" }} // replace with your real logo URL
          style={styles.logo}
        />

        <Text style={styles.header}>🏆 Dare Completed!</Text>

        <View style={styles.centerContent}>
          <Image
            source={{ uri: winner?.photoURL || "https://via.placeholder.com/200" }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{winner?.displayName || "Anonymous"}</Text>
          <Text style={styles.reward}>+{dare?.rewardStone} Stone 🪨</Text>
        </View>

        {/* Slogan Footer */}
        <Text style={styles.slogan}>Dare • Win • Share</Text>

        {/* Stone Icon Watermark */}
        <Text style={styles.watermark}>🪨</Text>
      </View>

      <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
        <Text style={styles.shareText}>📤 Share Story</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", alignItems: "center", justifyContent: "center" },
  storyCard: {
    width: width,
    height: height,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 80,
  },
  logo: {
    position: "absolute",
    top: 50,
    left: 30,
    width: 100,
    height: 40,
    resizeMode: "contain",
  },
  header: { fontSize: 28, fontWeight: "800", color: "#fff", textAlign: "center", marginTop: 100 },
  centerContent: { alignItems: "center", justifyContent: "center", flex: 1 },
  avatar: { width: 220, height: 220, borderRadius: 110, marginBottom: 24, borderWidth: 4, borderColor: "#FFD700" },
  name: { fontSize: 28, fontWeight: "700", color: "#fff" },
  reward: { fontSize: 22, marginTop: 8, color: "#FFD700", fontWeight: "600" },
  slogan: { fontSize: 18, color: "#fff", marginBottom: 60, fontWeight: "500" },
  watermark: { position: "absolute", bottom: 40, right: 30, fontSize: 50, opacity: 0.2 },
  shareBtn: { position: "absolute", bottom: 40, backgroundColor: "#FFD700", padding: 14, borderRadius: 10 },
  shareText: { color: "#111", fontWeight: "700", fontSize: 16 }
});
