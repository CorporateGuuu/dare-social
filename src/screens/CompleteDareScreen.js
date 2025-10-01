import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";

export default function CompleteDareScreen({ route, navigation }) {
  const { dareId } = route.params || {};
  const [caption, setCaption] = useState("");

  return (
    <View style={styles.container}>
      <View style={styles.uploadBox}><Text style={{ color: "#777" }}>Upload Photo/Video</Text></View>
      <TextInput
        placeholder="Caption"
        value={caption}
        onChangeText={setCaption}
        style={styles.input}
      />
      <TouchableOpacity style={styles.btn} onPress={() => navigation.popToTop()}>
        <Text style={styles.btnText}>Submit Proof</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>Proof will be voted on by peers.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  uploadBox: { height: 200, backgroundColor: "#eee", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, marginTop: 12 },
  btn: { backgroundColor: "#111", paddingVertical: 14, borderRadius: 10, marginTop: 12 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  hint: { textAlign: "center", color: "#777", marginTop: 8 },
});
