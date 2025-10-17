import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemeColor } from "../../hooks/use-theme-color";

export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const styles = createStyles(backgroundColor, textColor);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home Screen</Text>
    </View>
  );
}

const createStyles = (backgroundColor, textColor) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor
  },
  text: {
    color: textColor
  }
});
