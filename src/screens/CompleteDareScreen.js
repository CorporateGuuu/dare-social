import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { submitProof } from "../lib/firebase";

export default function CompleteDareScreen({ navigation, route }) {
  const { dare } = route.params;
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmitProof() {
    try {
      setLoading(true);
      await submitProof({
        dareId: dare.id,
        mediaUrl: "https://example.com/mock.jpg", // TODO: integrate Storage later
        caption,
      });
      Alert.alert("Submitted", "Proof submitted successfully!");
      navigation.popToTop();
    } catch (e) {
      Alert.alert("Error", e.message ?? "Failed to submit proof");
    } finally {
      setLoading(false);
    }
  }



  return (
    <View style={styles.container}>
      <View style={styles.uploadBox}>
        <Text style={{ color: "#777" }}>Upload Photo/Video (mock)</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Add a caption..."
        value={caption}
        onChangeText={setCaption}
      />
      <TouchableOpacity style={styles.btn} onPress={handleSubmitProof} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Submit Proof</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  uploadBox: { height: 180, backgroundColor: "#eee", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 12, marginTop: 12 },
  btn: { backgroundColor: "#111", padding: 14, borderRadius: 10, marginTop: 12 },
  btnText: { color: "#fff", textAlign: "center" },
  hint: { textAlign: "center", color: "#777", marginTop: 8 },
});
