import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PlaceholderCard from "../components/PlaceholderCard";
import { listDares } from "../lib/firebase";

export default function HomeFeedScreen({ navigation }) {
  const [dares, setDares] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDares() {
      try {
        const res = await listDares();
        setDares(res.data);
      } catch (e) {
        console.error("Failed to fetch dares:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchDares();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Home Feed</Text>
      <FlatList
        data={dares}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate("DareDetails", { dare: item })}>
            <PlaceholderCard title={item.title} subtitle={`+${item.rewardStone} Stone 🪨`} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
});
