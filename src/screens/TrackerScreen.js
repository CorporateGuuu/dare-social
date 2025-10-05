import { StyleSheet, Text, View } from "react-native";

export default function TrackerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tracker</Text>
      <Text style={styles.subheader}>Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16, alignItems: 'center', justifyContent: 'center' },
  header: { fontSize: 24, fontWeight: "700" },
  subheader: { fontSize: 16, color: "#888" },
});
