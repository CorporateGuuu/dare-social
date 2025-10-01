import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import { AuthContext, AuthProvider } from "./src/context/AuthContext";
import AchievementsScreen from "./src/screens/AchievementsScreen";
import ChallengesScreen from "./src/screens/ChallengesScreen";
import CreateChallengeFormScreen from "./src/screens/CreateChallengeFormScreen";
import LoginScreen from "./src/screens/LoginScreen";
// Import other screens: AchievementsScreen, ChallengesScreen, etc.

const Stack = createStackNavigator();

function App() {
  return (
    <AuthProvider>
      <AuthContext.Consumer>
        {({ user, isLoading }) => {
          if (isLoading) return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text>Loading...</Text>
            </View>
          );

          return (
            <NavigationContainer>
              <Stack.Navigator>
                {user ? (
                  <>
                    <Stack.Screen name="Achievements" component={AchievementsScreen} />
                    <Stack.Screen name="Challenges" component={ChallengesScreen} />
                    <Stack.Screen name="CreateChallengeForm" component={CreateChallengeFormScreen} />
                    {/* Add other screens */}
                  </>
                ) : (
                  <Stack.Screen name="Login" component={LoginScreen} />
                )}
              </Stack.Navigator>
            </NavigationContainer>
          );
        }}
      </AuthContext.Consumer>
    </AuthProvider>
  );
}

export default App;
