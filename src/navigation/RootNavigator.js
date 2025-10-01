import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/native-stack';

// Screens
import ChallengesScreen from '../screens/ChallengesScreen';
import CompleteDareScreen from '../screens/CompleteDareScreen';
import DareDetailsScreen from '../screens/DareDetailsScreen';
import HomeFeedScreen from '../screens/HomeFeedScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WalletScreen from '../screens/WalletScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const map = {
            HomeFeed: "home-outline",
            Leaderboard: "trophy-outline",
            Wallet: "wallet-outline",
            Profile: "person-circle-outline",
          };
          return <Ionicons name={map[route.name]} size={size ?? 20} color={color ?? "#333"} />;
        },
        tabBarActiveTintColor: "#111",
        tabBarInactiveTintColor: "#888",
      })}
    >
      <Tab.Screen name="HomeFeed" component={HomeFeedScreen} options={{ tabBarLabel: "Home" }} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} options={{ tabBarLabel: "Ranks" }} />
      <Tab.Screen name="Wallet" component={WalletScreen} options={{ tabBarLabel: "Wallet" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: "Profile" }} />
    </Tab.Navigator>
  );
}

const RootNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Onboarding">
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="DareDetails" component={DareDetailsScreen} />
      <Stack.Screen name="CompleteDare" component={CompleteDareScreen} />
      <Stack.Screen name="Challenges" component={ChallengesScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
