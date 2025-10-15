import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import CreateDareScreen from "../screens/CreateDareScreen";
import ReferralScreen from "../screens/ReferralScreen";
import PostDetailsScreen from "../screens/PostDetailsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="CreateDare" component={CreateDareScreen} />
        <Stack.Screen name="Referrals" component={ReferralScreen} />
        <Stack.Screen name="PostDetails" component={PostDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
