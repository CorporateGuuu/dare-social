import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Alert, Image, Picker, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { createDare } from "../services/dareService";
import { auth } from "../config/firebase";

export default function CreateDareScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState(null);
  const [wagerType, setWagerType] = useState("none");
  const [wagerAmount, setWagerAmount] = useState("0");

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setMedia(result.assets[0].uri);
  };

  const handleCreate = async () => {
    if (!title.trim()) return Alert.alert("Error", "Please enter a title");
    try {
      await createDare({
        title,
        description,
        mediaUri: media,
        creatorId: auth.currentUser.uid,
        wagerType,
        wagerAmount: parseInt(wagerAmount) || 0,
      });
      Alert.alert("Success", "Dare created!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Dare Title"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        placeholder="Description"
        style={[styles.input, { height: 80 }]}
        multiline
        value={description}
        onChangeText={setDescription}
      />
      {media && <Image source={{ uri: media }} style={styles.preview} />}
      <Button title="Pick Media" onPress={pickMedia} />
      <Text>Wager Type:</Text>
      <Picker selectedValue={wagerType} onValueChange={setWagerType} style={styles.picker}>
        <Picker.Item label="None" value="none" />
        <Picker.Item label="1v1" value="1v1" />
        <Picker.Item label="Group" value="group" />
      </Picker>
      <TextInput
        placeholder="Wager Amount (Jade)"
        style={styles.input}
        value={wagerAmount}
        onChangeText={setWagerAmount}
        keyboardType="numeric"
      />
      <Button title="Create Dare" onPress={handleCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  input: { borderWidth: 1, padding: 10, borderRadius: 5, marginBottom: 10 },
  preview: { width: "100%", height: 200, borderRadius: 10, marginVertical: 10 },
  picker: { height: 50, width: "100%", marginBottom: 10 }
});
