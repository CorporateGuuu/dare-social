import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { acceptDare, db } from "../lib/firebase";

export default function DareDetailsScreen({ navigation, route }) {
  const { dare } = route.params;
  const [loading, setLoading] = useState(false);
  const [proofs, setProofs] = useState([]);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(doc(collection(db, "dares"), dare.id), "proofs"), (snapshot) => {
      const proofsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProofs(proofsList);
    });
    return unsubscribe;
  }, [dare.id]);

  useEffect(() => {
    if (dare.status === "completed" && dare.winnerId) {
      getDoc(doc(db, "users", dare.winnerId)).then((docSnap) => {
        if (docSnap.exists()) {
          setWinner(docSnap.data());
        }
      });
    }
  }, [dare]);

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
      <Text style={styles.description}>{dare.description}</Text>
      <Image source={{ uri: dare.mediaUrl }} style={styles.mediaUrl} />
      <Text style={styles.creatorId}>Creator: {dare.creatorId}</Text>
      <Text style={styles.participants}>Participants: {dare.participants.join(', ') || "None"}</Text>
      <Text style={styles.status}>Status: {dare.status}</Text>
      <Text style={styles.wagerType}>Wager Type: {dare.wagerType}</Text>
      <Text style={styles.wagerAmount}>Wager Amount: {dare.wagerAmount} Jade</Text>
      <Text style={styles.createdAt}>Created: {new Date(dare.createdAt).toLocaleDateString()}</Text>
      {dare.completedAt && <Text style={styles.completedAt}>Completed: {new Date(dare.completedAt).toLocaleDateString()}</Text>}

      <TouchableOpacity style={styles.btnPrimary} onPress={handleAccept} disabled={loading || dare.status === "completed"}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>
          {dare.status === "completed" ? "Challenge Completed" : "Accept Dare"}
        </Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.goBack()}>
        <Text style={styles.btnSecondaryText}>Decline</Text>
      </TouchableOpacity>

      {dare.status === "active" && proofs.length > 0 && (
        <View>
          <Text style={styles.proofsTitle}>Submitted Proofs: {proofs.length}</Text>
          <TouchableOpacity
            style={styles.voteOnProofsBtn}
            onPress={() => navigation.navigate("Vote", { dareId: dare.id })}
          >
            <Text style={styles.voteOnProofsText}>Vote on Proofs</Text>
          </TouchableOpacity>
        </View>
      )}

      {dare.status === "completed" && (
        <View>
          <Text style={styles.proofsTitle}>Challenge Completed!</Text>
          <TouchableOpacity
            style={[styles.voteOnProofsBtn, { backgroundColor: "#ffc107" }]}
            onPress={() => navigation.navigate("Winner", { dare, winner })}
          >
            <Text style={styles.voteOnProofsText}>View Winner</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  media: { height: 220, backgroundColor: "#eee", borderRadius: 12, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "700" },
  description: { fontSize: 14, marginTop: 6, marginBottom: 10 },
  mediaUrl: { width: "100%", height: 200, borderRadius: 10, marginVertical: 10 },
  creatorId: { fontSize: 14, color: "#666", marginBottom: 4 },
  participants: { fontSize: 14, color: "#666", marginBottom: 4 },
  status: { fontSize: 14, color: "#666", marginBottom: 4 },
  wagerType: { fontSize: 14, color: "#666", marginBottom: 4 },
  wagerAmount: { fontSize: 14, color: "#666", marginBottom: 4 },
  createdAt: { fontSize: 14, color: "#666", marginBottom: 4 },
  completedAt: { fontSize: 14, color: "#666", marginBottom: 4 },
  reward: { fontSize: 14, color: "#333", marginBottom: 16 },
  btnPrimary: { backgroundColor: "#111", paddingVertical: 14, borderRadius: 10, marginTop: 8 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  btnSecondary: { paddingVertical: 12, borderRadius: 10, marginTop: 8, borderWidth: 1, borderColor: "#ccc" },
  btnSecondaryText: { textAlign: "center", color: "#333", fontWeight: "600" },
  proofsTitle: { fontSize: 18, fontWeight: "600", marginTop: 20, marginBottom: 10 },
  voteOnProofsBtn: { backgroundColor: "#28a745", paddingVertical: 12, borderRadius: 10, marginTop: 10 },
  voteOnProofsText: { color: "#fff", textAlign: "center", fontWeight: "600" },
});
