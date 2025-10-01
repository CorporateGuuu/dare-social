import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import PlaceholderCard from "../components/PlaceholderCard";
import { useDares } from "../hooks/useDares";

export default function HomeFeedScreen({ navigation }) {
  const { dares, loading } = useDares();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Home Feed</Text>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Home Feed</Text>

      <FlatList
        data={dares}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate("DareDetails", { dareId: item.id })}>
            <PlaceholderCard title={item.title} subtitle={`+${item.reward} Stone 🪨`} />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
});
