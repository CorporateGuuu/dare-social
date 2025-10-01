import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { ensureSignedIn } from "./src/lib/firebase";

export default function App() {
  useEffect(() => { ensureSignedIn(); }, []);
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
