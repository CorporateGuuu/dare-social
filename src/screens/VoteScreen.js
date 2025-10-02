import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { castVote, db } from "../lib/firebase";

export default function VoteScreen({ route }) {
  const { dareId } = route.params;
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to all proofs for this dare
    const q = query(
      collection(db, "dares", dareId, "proofs"),
      orderBy("votes", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setProofs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, [dareId]);

  async function handleVote(proofId) {
    try {
      await castVote({ dareId, proofId });
      Alert.alert("Vote Submitted ✅", "Your vote has been counted.");
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to submit vote.");
    }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Vote on Proofs</Text>
      <FlatList
        data={proofs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: item.mediaUrl }}
              style={styles.media}
              resizeMode="cover"
            />
            <Text style={styles.caption}>{item.caption}</Text>
            <Text style={styles.votes}>Votes: {item.votes || 0}</Text>

            <TouchableOpacity
              style={styles.voteBtn}
              onPress={() => handleVote(item.id)}
            >
              <Text style={styles.voteText}>Vote</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  card: {
    backgroundColor: "#fafafa",
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  media: { height: 180, borderRadius: 8, marginBottom: 8 },
  caption: { fontSize: 14, marginBottom: 6 },
  votes: { fontSize: 12, color: "#555", marginBottom: 8 },
  voteBtn: {
    backgroundColor: "#111",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  voteText: { color: "#fff", fontWeight: "600" },
});
