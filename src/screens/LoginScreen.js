import { useContext, useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { signIn } from "../services/authService";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useContext(AuthContext);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dare Social</Text>
      <TextInput
        placeholder="Email (use test@test.com for mock login)"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password (use test123 for mock login)"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
      <Text onPress={() => navigation.navigate("Register")} style={styles.link}>
        Create an account
      </Text>
    </View>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, textAlign: "center", marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  link: { textAlign: "center", marginTop: 10, color: "blue" }
});
