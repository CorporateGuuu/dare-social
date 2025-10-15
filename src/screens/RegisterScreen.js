import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { signUp } from "../services/authService";

export default function RegisterScreen({ navigation, route }) {
  const { referralCode } = route.params || {};
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [enteredReferralCode, setEnteredReferralCode] = useState(referralCode || "");

  const handleRegister = async () => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (!password) {
      Alert.alert("Missing Password", "Please enter a password.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password should be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    try {
      await signUp(email, password, enteredReferralCode);
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => navigation.replace("Main") }
      ]);
    } catch (error) {
      Alert.alert("Registration Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        placeholder="Confirm Password"
        secureTextEntry
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TextInput
        placeholder="Referral Code (optional)"
        style={styles.input}
        value={enteredReferralCode}
        onChangeText={setEnteredReferralCode}
        autoCapitalize="characters"
      />
      <Button title="Register" onPress={handleRegister} />
      <Text onPress={() => navigation.navigate("LoginScreen")} style={styles.link}>
        Already have an account? Login
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
