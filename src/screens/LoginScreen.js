import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { signIn } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import { useThemeColor } from "../../hooks/use-theme-color";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useContext(AuthContext);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const accentColor = useThemeColor({}, 'accent');

  const handleLogin = async () => {
    // Mock login for testing
    if (email === "test@test.com" && password === "test123") {
      // Set mock user data
      setUser({
        id: "mock-user-id",
        username: "@testuser",
        stones: 100,
        xp: 50,
        level: 2,
        badges: [],
        currentStreak: 5,
        totalDaresCompleted: 10,
      });
      navigation.replace("Main");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (!password) {
      Alert.alert("Missing Password", "Please enter your password.");
      return;
    }

    try {
      await signIn(email, password);
      navigation.replace("Main");
    } catch (error) {
      Alert.alert("Login Error", error.message);
    }
  };

  const dynamicStyles = createStyles(backgroundColor, textColor, borderColor, accentColor);

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>Dare Social</Text>
      <TextInput
        placeholder="Email (use test@test.com for mock login)"
        style={dynamicStyles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password (use test123 for mock login)"
        secureTextEntry
        style={dynamicStyles.input}
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
      <Text onPress={() => navigation.navigate("Register")} style={dynamicStyles.link}>
        Create an account
      </Text>
    </View>
  );
}

const createStyles = (backgroundColor, textColor, borderColor, accentColor) => StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor },
  title: { fontSize: 24, textAlign: "center", marginBottom: 20, color: textColor },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5, borderColor, backgroundColor: backgroundColor, color: textColor },
  link: { textAlign: "center", marginTop: 10, color: accentColor }
});
